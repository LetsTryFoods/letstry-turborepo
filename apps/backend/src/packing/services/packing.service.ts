import { Injectable } from '@nestjs/common';
import { OrderAssignmentService } from './domain/order-assignment.service';
import { PackingQueueService } from './domain/packing-queue.service';

import { ScanLogCrudService } from './core/scan-log-crud.service';
import { EvidenceCrudService } from './core/evidence-crud.service';
import { PackingLifecycleService } from './domain/packing-lifecycle.service';
import { PackingOrderCrudService } from './core/packing-order-crud.service';
import { BoxRecommendationService } from '../../box-size/services/domain/box-recommendation.service';
import { PackingLoggerService } from './domain/packing-logger.service';
import { ScanLoggerService } from './domain/scan-logger.service';
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
    private readonly scanLogCrud: ScanLogCrudService,
    private readonly evidenceCrud: EvidenceCrudService,
    private readonly packingLifecycle: PackingLifecycleService,
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly boxRecommendation: BoxRecommendationService,
    private readonly packingLogger: PackingLoggerService,
    private readonly scanLogger: ScanLoggerService,
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
  async getPackerAssignedOrders(packerId: string): Promise<any[]> {
    const orders = await this.packingOrderCrud.findByPacker(packerId);
    return orders.filter(
      (order: any) => order.status === 'assigned' || order.status === 'packing'
    );
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


  async batchScanItems(
    packingOrderId: string,
    items: { productId: string; eans: string[] }[],
    packerId: string,
  ): Promise<any> {
    this.scanLogger.logBatchScanRequest({ packingOrderId, items, packerId });

    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);

    if (!packingOrder) {
      throw new Error('Packing order not found');
    }

    if (packingOrder.assignedTo !== packerId) {
      throw new Error('This order is no longer assigned to you');
    }

    const validationResults: any[] = [];
    let hasAnyError = false;

    for (const item of items) {
      const orderItem = packingOrder.items.find(
        (i: any) => i.productId === item.productId,
      );

      if (!orderItem) {
        validationResults.push({
          productId: item.productId,
          isValid: false,
          errorType: 'item_not_found',
          errorMessage: `Product ${item.productId} not found in packing order`,
          scannedQuantity: item.eans.length,
        });
        hasAnyError = true;
        continue;
      }

      if (item.eans.length !== orderItem.quantity) {
        validationResults.push({
          productId: item.productId,
          isValid: false,
          errorType: 'quantity_mismatch',
          errorMessage: `Expected ${orderItem.quantity} scans, got ${item.eans.length}`,
          expectedQuantity: orderItem.quantity,
          scannedQuantity: item.eans.length,
          productName: orderItem.name,
        });
        hasAnyError = true;
        continue;
      }

      let eanError = false;
      for (const ean of item.eans) {
        if (ean !== orderItem.ean) {
          validationResults.push({
            productId: item.productId,
            isValid: false,
            errorType: 'ean_mismatch',
            errorMessage: `EAN ${ean} does not match expected EAN ${orderItem.ean}`,
            expectedQuantity: orderItem.quantity,
            scannedQuantity: item.eans.length,
            productName: orderItem.name,
          });
          hasAnyError = true;
          eanError = true;
          break;
        }
      }

      if (!eanError) {
        validationResults.push({
          productId: item.productId,
          isValid: true,
          expectedQuantity: orderItem.quantity,
          scannedQuantity: item.eans.length,
          productName: orderItem.name,
        });
      }
    }

    await this.scanLogCrud.create({
      packingOrderId,
      packerId,
      isValid: !hasAnyError,
      isBatchSuccess: !hasAnyError,
      scannedAt: new Date(),
      items: validationResults,
    });

    if (hasAnyError) {
      await this.packingOrderCrud.setErrorFlag(packingOrderId);
      this.scanLogger.logBatchScanResponse(packingOrderId, {
        success: false,
        validations: validationResults,
      });

      return {
        success: false,
        totalProcessed: items.length,
        successCount: 0,
        failureCount: items.length,
        validations: validationResults,
        errorMessage: 'Batch validation failed',
      };
    }

    this.scanLogger.logBatchScanResponse(packingOrderId, {
      success: true,
      totalScans: items.reduce((sum, item) => sum + item.eans.length, 0),
    });

    return {
      success: true,
      totalProcessed: items.length,
      successCount: items.length,
      failureCount: 0,
      validations: validationResults,
      totalScans: items.reduce((sum, item) => sum + item.eans.length, 0),
    };
  }


  async uploadEvidence(
    packingOrderId: string,
    imageUrls: string[],
    boxCode: string,
    packerId: string,
  ): Promise<any> {
    this.scanLogger.logEvidenceRequest({ packingOrderId, imageCount: imageUrls.length, boxCode });

    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);
    if (!packingOrder) {
      throw new Error('Packing order not found');
    }

    if (packingOrder.assignedTo !== packerId) {
      throw new Error('This order is no longer assigned to you');
    }

    const evidence = await this.evidenceCrud.create({
      packingOrderId,
      packerId: 'current_packer',
      prePackImages: imageUrls,
      postPackImages: [],
      actualBox: { code: boxCode, dimensions: { l: 0, w: 0, h: 0 } },
      uploadedAt: new Date(),
    });

    this.packingLogger.logEvidenceUploaded(packingOrderId, imageUrls.length);
    this.scanLogger.logEvidenceResponse(packingOrderId, evidence._id?.toString());

    return this.packingOrderCrud.findById(packingOrderId);
  }

  async completePacking(packingOrderId: string, packerId: string): Promise<any> {
    this.scanLogger.logCompletePackingRequest(packingOrderId);

    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);

    if (!packingOrder) {
      this.scanLogger.logScanError('completePacking', packingOrderId, new Error('Packing order not found'));
      throw new Error('Packing order not found');
    }

    if (packingOrder.assignedTo !== packerId) {
      this.scanLogger.logScanError('completePacking', packingOrderId, new Error('Order not assigned to this packer'));
      throw new Error('This order is no longer assigned to you');
    }

    this.scanLogger.logCompletePackingStep('ORDER_FOUND', {
      packingOrderId,
      orderId: packingOrder.orderId,
      assignedTo: packingOrder.assignedTo,
      status: packingOrder.status,
    });

    const hasSuccessfulScan = await this.scanLogCrud.hasSuccessfulBatchScan(packingOrderId);

    if (!hasSuccessfulScan) {
      this.scanLogger.logScanError('completePacking', packingOrderId, new Error('No successful batch scan found'));
      throw new Error('Cannot complete packing: No successful batch scan found for this order');
    }

    this.scanLogger.logCompletePackingStep('BATCH_SCAN_VERIFIED', {
      packingOrderId,
      hasSuccessfulScan: true,
    });

    const evidence = await this.evidenceCrud.findByOrder(packingOrderId);

    if (!evidence || !evidence.prePackImages || evidence.prePackImages.length === 0) {
      this.scanLogger.logScanError('completePacking', packingOrderId, new Error('No packing evidence found'));
      throw new Error('Cannot complete packing: Please upload pre-pack images first');
    }

    this.scanLogger.logCompletePackingStep('EVIDENCE_VERIFIED', {
      packingOrderId,
      evidenceId: evidence._id,
    });

    await this.packingLifecycle.completePacking(packingOrderId);

    this.scanLogger.logCompletePackingStep('STATUS_COMPLETED', { packingOrderId });

    await this.orderRepository.updateOrderStatus(
      packingOrder.orderId,
      OrderStatus.PACKED,
    );

    this.scanLogger.logCompletePackingStep('ORDER_STATUS_PACKED', {
      packingOrderId,
      orderId: packingOrder.orderId,
    });

    const duration = this.calculatePackingDuration(packingOrder.packingStartedAt);

    this.packingLogger.logPackingCompleted(
      packingOrderId,
      packingOrder.assignedTo,
      duration,
    );

    this.scanLogger.logCompletePackingStep('SHIPMENT_INITIATION', {
      packingOrderId,
      orderId: packingOrder.orderId,
    });

    await this.initiateShipmentCreation(packingOrder.orderId, packingOrderId);

    const result = await this.packingOrderCrud.findById(packingOrderId);

    this.scanLogger.logCompletePackingResponse(packingOrderId, {
      status: result?.status,
      durationMinutes: duration,
    });

    return result;
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
