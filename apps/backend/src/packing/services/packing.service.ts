import { Injectable } from '@nestjs/common';
import { OrderAssignmentService } from './domain/order-assignment.service';
import { PackingQueueService } from './domain/packing-queue.service';
import { ScanValidationService } from './domain/scan-validation.service';
import { ScanLogCrudService } from './core/scan-log-crud.service';
import { EvidenceCrudService } from './core/evidence-crud.service';
import { PackingLifecycleService } from './domain/packing-lifecycle.service';
import { PackingOrderCrudService } from './core/packing-order-crud.service';
import { BoxRecommendationService } from '../../box-size/services/domain/box-recommendation.service';
import { PackingLoggerService } from './domain/packing-logger.service';
import { OrderStatus } from '../../order/order.schema';
import { PackingOrderCreatorService } from './domain/packing-order-creator.service';
import { Order } from '../../order/order.schema';
import { OrderRepository } from '../../order/services/order.repository';
import { ShipmentService } from '../../shipment/services/shipment.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from '../../address/address.schema';
import { PackingEvidence } from '../entities/packing-evidence.entity';

@Injectable()
export class PackingService {
  constructor(
    private readonly orderAssignment: OrderAssignmentService,
    private readonly packingQueue: PackingQueueService,
    private readonly scanValidation: ScanValidationService,
    private readonly scanLogCrud: ScanLogCrudService,
    private readonly evidenceCrud: EvidenceCrudService,
    private readonly packingLifecycle: PackingLifecycleService,
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly boxRecommendation: BoxRecommendationService,
    private readonly packingLogger: PackingLoggerService,
    private readonly orderRepository: OrderRepository,
    private readonly packingOrderCreator: PackingOrderCreatorService,
    private readonly shipmentService: ShipmentService,
    private readonly configService: ConfigService,
    @InjectModel(Address.name)
    private readonly addressModel: Model<Address>,
    @InjectModel(PackingEvidence.name)
    private readonly packingEvidenceModel: Model<PackingEvidence>,
  ) { }

  async createPackingOrder(order: Order): Promise<void> {
    const packingOrder = await this.packingOrderCreator.createFromOrder(order);
    await this.packingQueue.addToQueue(order._id.toString());
  }

  async assignOrderToPacker(packerId: string): Promise<any> {
    const orderData = await this.packingQueue.getNextOrder();
    if (!orderData) return null;

    await this.orderAssignment.assignOrder(orderData.orderId, packerId);
    return this.packingOrderCrud.findById(orderData.orderId);
  }

  async startPacking(packingOrderId: string): Promise<any> {
    await this.packingLifecycle.startPacking(packingOrderId);

    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);
    if (packingOrder) {
      this.packingLogger.logPackingStarted(
        packingOrderId,
        packingOrder.assignedTo,
      );
    }

    return packingOrder;
  }

  async scanItem(
    packingOrderId: string,
    ean: string,
    packerId: string,
  ): Promise<any> {
    const validation = await this.scanValidation.validateEAN(
      packingOrderId,
      ean,
    );

    const scanLog = await this.scanLogCrud.create({
      packingOrderId,
      packerId,
      ean,
      isValid: validation.isValid,
      errorType: validation.errorType,
      scannedAt: new Date(),
      matchedProductId: validation.item?.productId,
      matchedSku: validation.item?.sku,
      expectedQuantity: validation.item?.quantity,
    });

    if (!validation.isValid) {
      await this.packingOrderCrud.setErrorFlag(packingOrderId);
      this.packingLogger.logScanError(
        packingOrderId,
        ean,
        validation.errorType || 'UNKNOWN_ERROR',
      );
    }

    return {
      isValid: validation.isValid,
      errorType: validation.errorType,
      itemName: validation.item?.name,
    };
  }

  async batchScanItems(
    packingOrderId: string,
    items: { ean: string }[],
    packerId: string,
  ): Promise<any> {
    const results: any[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const item of items) {
      // Process each scan individually
      const validation = await this.scanValidation.validateEAN(
        packingOrderId,
        item.ean,
      );

      await this.scanLogCrud.create({
        packingOrderId,
        packerId,
        ean: item.ean,
        isValid: validation.isValid,
        errorType: validation.errorType,
        scannedAt: new Date(),
        matchedProductId: validation.item?.productId,
        matchedSku: validation.item?.sku,
        expectedQuantity: validation.item?.quantity,
      });

      if (!validation.isValid) {
        await this.packingOrderCrud.setErrorFlag(packingOrderId);
        this.packingLogger.logScanError(
          packingOrderId,
          item.ean,
          validation.errorType || 'UNKNOWN_ERROR',
        );
        failureCount++;
      } else {
        successCount++;
      }

      results.push({
        ean: item.ean,
        isValid: validation.isValid,
        errorType: validation.errorType,
        itemName: validation.item?.name,
      });
    }

    return {
      totalProcessed: results.length,
      successCount,
      failureCount,
      results,
    };
  }

  async uploadEvidence(
    packingOrderId: string,
    imageUrls: string[],
    boxCode: string,
  ): Promise<any> {
    

    const evidence = await this.evidenceCrud.create({
      packingOrderId,
      packerId: 'current_packer', // This should be updated to use actual packerId if available in context
      prePackImages: imageUrls,
      postPackImages: [], // Or handle if postPackImages are sent separately
      actualBox: { code: boxCode, dimensions: { l: 0, w: 0, h: 0 } },
      uploadedAt: new Date(),
    });

    this.packingLogger.logEvidenceUploaded(packingOrderId, imageUrls.length);

    return evidence;
  }

  async completePacking(packingOrderId: string): Promise<any> {
    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);

    if (!packingOrder) {
      throw new Error('Packing order not found');
    }

    await this.packingLifecycle.completePacking(packingOrderId);

    await this.orderRepository.updateOrderStatus(
      packingOrder.orderId,
      OrderStatus.PACKED,
    );

    const duration = this.calculatePackingDuration(packingOrder.packingStartedAt);

    this.packingLogger.logPackingCompleted(
      packingOrderId,
      packingOrder.assignedTo,
      duration,
    );

    await this.initiateShipmentCreation(packingOrder.orderId, packingOrderId);

    return this.packingOrderCrud.findById(packingOrderId);
  }

  private calculatePackingDuration(packingStartedAt?: Date): number {
    return packingStartedAt
      ? Math.floor((Date.now() - packingStartedAt.getTime()) / 60000)
      : 0;
  }

  private async initiateShipmentCreation(orderId: string, packingOrderId: string): Promise<void> {
    try {
      const order = await this.orderRepository.findById(orderId);
      const packingEvidence = await this.packingEvidenceModel.findOne({ packingOrderId }).exec();
      const shippingAddress = order?.shippingAddressId
        ? await this.addressModel.findById(order.shippingAddressId).exec()
        : null;

      if (!order || !packingEvidence || !shippingAddress) {
        this.packingLogger.logError('Missing data for shipment creation', new Error('Incomplete data'), {
          orderId,
          packingOrderId,
        });
        return;
      }

      const boxDimensions = packingEvidence.actualBox?.dimensions || packingEvidence.recommendedBox?.dimensions;
      
      if (!boxDimensions) {
        this.packingLogger.logError('No box dimensions found', new Error('Missing dimensions'), {
          orderId,
          packingOrderId,
        });
        return;
      }

      const shipmentPayload = this.buildShipmentPayload(orderId, order, boxDimensions, shippingAddress);
      await this.shipmentService.createShipment(shipmentPayload);
    } catch (error) {
      this.packingLogger.logError('Failed to create shipment', error, {
        orderId,
        packingOrderId,
      });
    }
  }

  private buildShipmentPayload(orderId: string, order: any, boxDimensions: any, shippingAddress: any) {
    return {
      orderId,
      serviceType: this.configService.get('DTDC_DEFAULT_SERVICE_TYPE') || 'B2C SMART EXPRESS',
      loadType: this.configService.get('DTDC_DEFAULT_LOAD_TYPE') || 'NON-DOCUMENT',
      weight: 1,
      declaredValue: parseFloat(order.totalAmount) || 0,
      numPieces: 1,
      dimensions: {
        length: boxDimensions.l,
        width: boxDimensions.w,
        height: boxDimensions.h,
      },
      originDetails: {
        name: this.configService.get('WAREHOUSE_NAME') || 'LetsTry Foods',
        phone: this.configService.get('WAREHOUSE_PHONE') || '',
        alternatePhone: this.configService.get('WAREHOUSE_ALT_PHONE'),
        addressLine1: this.configService.get('WAREHOUSE_ADDRESS_LINE1') || '',
        addressLine2: this.configService.get('WAREHOUSE_ADDRESS_LINE2'),
        pincode: this.configService.get('WAREHOUSE_PINCODE') || '',
        city: this.configService.get('WAREHOUSE_CITY') || '',
        state: this.configService.get('WAREHOUSE_STATE') || '',
        latitude: this.configService.get('WAREHOUSE_LATITUDE'),
        longitude: this.configService.get('WAREHOUSE_LONGITUDE'),
      },
      destinationDetails: {
        name: shippingAddress.recipientName,
        phone: shippingAddress.recipientPhone,
        alternatePhone: undefined,
        addressLine1: shippingAddress.buildingName + (shippingAddress.floor ? `, Floor ${shippingAddress.floor}` : ''),
        addressLine2: [shippingAddress.streetArea, shippingAddress.landmark].filter(Boolean).join(', '),
        pincode: shippingAddress.postalCode,
        city: shippingAddress.addressLocality,
        state: shippingAddress.addressRegion,
        latitude: shippingAddress.latitude?.toString(),
        longitude: shippingAddress.longitude?.toString(),
      },
      codAmount: order.metadata?.paymentMethod === 'COD' ? parseFloat(order.totalAmount) : undefined,
      codCollectionMode: order.metadata?.paymentMethod === 'COD' ? 'CASH' : undefined,
      invoiceNumber: order.orderId,
      invoiceDate: order.createdAt,
      commodityId: this.configService.get('DTDC_DEFAULT_COMMODITY_ID') || '10',
      description: 'Food Products',
    };
  }

  async getBoxRecommendation(packingOrderId: string): Promise<any> {
    const order = await this.packingOrderCrud.findById(packingOrderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return this.boxRecommendation.selectOptimalBox(order.items);
  }

  async getAllPackingOrders(filters: { packerId?: string; status?: string }): Promise<any[]> {
    const dbFilters: any = {};

    if (filters.packerId) {
      dbFilters.assignedTo = filters.packerId;
    }

    if (filters.status) {
      dbFilters.status = filters.status;
    }

    return this.packingOrderCrud.findAll(dbFilters);
  }

  async getEvidenceByOrder(packingOrderId: string): Promise<any> {
    return this.evidenceCrud.findByOrder(packingOrderId);
  }

  async reassignOrder(
    packingOrderId: string,
    newPackerId?: string,
  ): Promise<any> {
    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);

    if (!packingOrder) {
      throw new Error('Packing order not found');
    }

    const oldPackerId = packingOrder.assignedTo;

    if (newPackerId) {
      await this.orderAssignment.assignOrder(packingOrderId, newPackerId);
      this.packingLogger.logReassignment(
        packingOrderId,
        oldPackerId,
        newPackerId,
        'MANUAL',
      );
    } else {
      await this.packingQueue.processReassignment();
    }

    return this.packingOrderCrud.findById(packingOrderId);
  }
}
