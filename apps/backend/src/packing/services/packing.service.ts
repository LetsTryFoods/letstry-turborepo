import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { OrderAssignmentService } from './domain/order-assignment.service';
import { PackingQueueService } from './domain/packing-queue.service';
import { SettingsService } from '../../settings/settings.service';

import { ScanLogCrudService } from './core/scan-log-crud.service';
import { EvidenceCrudService } from './core/evidence-crud.service';
import { PackingLifecycleService } from './domain/packing-lifecycle.service';
import { PackingOrderCrudService } from './core/packing-order-crud.service';
import { BoxRecommendationService } from '../../box-size/services/domain/box-recommendation.service';
import { PackingLoggerService } from './domain/packing-logger.service';
import { ScanLoggerService } from './domain/scan-logger.service';
import { AdminPunchShipmentInput } from '../dto/admin-punch-shipment.input';
import { CommonModule } from '../../common/common.module';
import { OrderStatus } from '../../order/order.schema';
import { PackingOrderCreatorService } from './domain/packing-order-creator.service';
import { Order } from '../../order/order.schema';
import { OrderRepository } from '../../order/services/order.repository';
import { ShipmentService } from '../../shipment/services/shipment.service';
import { ShipmentLoggerService } from '../../shipment/services/shipment-logger.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address } from '../../address/address.schema';
import { PackingOrder, PackingStatus } from '../entities/packing-order.entity';
import { PackingEvidence } from '../entities/packing-evidence.entity';
import { InventoryService } from '../../product/services/inventory.service';
import { InventoryAction } from '../../product/inventory-log.schema';
import { UploadService } from '../../upload/upload.service';
import * as crypto from 'crypto';

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
    private readonly shipmentLogger: ShipmentLoggerService,
    private readonly configService: ConfigService,
    @InjectQueue('whatsapp-notification-queue')
    private readonly whatsappQueue: Queue,
    @InjectModel(Address.name)
    private readonly addressModel: Model<Address>,
    @InjectModel(PackingEvidence.name)
    private readonly packingEvidenceModel: Model<PackingEvidence>,
    private readonly inventoryService: InventoryService,
    private readonly settingsService: SettingsService,
    private readonly uploadService: UploadService,
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
      (order: any) => order.status === 'assigned' || order.status === 'packing',
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

  async markItemShort(
    packingOrderId: string,
    productId: string,
    shortQty: number,
    packerId: string,
    isComponent: boolean = false,
  ): Promise<any> {
    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);
    if (!packingOrder) throw new Error('Packing order not found');
    if (packingOrder.assignedTo !== packerId) throw new Error('This order is no longer assigned to you');

    const updatedItems = packingOrder.items.map((i: any) => {
      if (i.productId === productId) {
        if (isComponent) {
          return { ...i, shortComponentCount: (i.shortComponentCount || 0) + shortQty };
        } else {
          return { ...i, shortCount: (i.shortCount || 0) + shortQty };
        }
      }
      return i;
    });

    const item = packingOrder.items.find(i => i.productId === productId);

    const updateData: any = { items: updatedItems };
    if (item) {
      updateData.$push = {
        retrospectiveErrors: {
          errorType: 'short_item',
          flaggedAt: new Date(),
          flaggedBy: packerId,
          notes: `Item ${item.name} marked ${isComponent ? 'component ' : ''}short by ${shortQty} units.`,
          severity: 'major',
          source: 'quality_audit',
        }
      };
    }

    return this.packingOrderCrud.update(packingOrderId, updateData);
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

      const expectedEansArray = orderItem.ean ? orderItem.ean.split(',').map((e: string) => e.trim()).filter((e: string) => e) : [];
      const isCombo = expectedEansArray.length > 1;

      const nonShortedQuantity = orderItem.quantity - (orderItem.shortCount || 0);
      let expectedTotalScans = nonShortedQuantity;
      if (isCombo) {
        expectedTotalScans = (nonShortedQuantity * expectedEansArray.length) - (orderItem.shortComponentCount || 0);
      }

      if (item.eans.length !== expectedTotalScans) {
        validationResults.push({
          productId: item.productId,
          isValid: false,
          errorType: 'quantity_mismatch',
          errorMessage: `Expected ${expectedTotalScans} scans, got ${item.eans.length}`,
          expectedQuantity: expectedTotalScans,
          scannedQuantity: item.eans.length,
          productName: orderItem.name,
        });
        hasAnyError = true;
        continue;
      }

      let eanError = false;

      if (isCombo) {
        const scanCounts: Record<string, number> = {};
        for (const ean of item.eans) {
          scanCounts[ean] = (scanCounts[ean] || 0) + 1;
        }

        for (const ean of item.eans) {
          if (!expectedEansArray.includes(ean)) {
            validationResults.push({
              productId: item.productId,
              isValid: false,
              errorType: 'ean_mismatch',
              errorMessage: `EAN ${ean} does not belong to combo components`,
              expectedQuantity: expectedTotalScans,
              scannedQuantity: item.eans.length,
              productName: orderItem.name,
            });
            hasAnyError = true;
            eanError = true;
            break;
          }
        }

        if (!eanError) {
          for (const [scannedEan, count] of Object.entries(scanCounts)) {
            if (count > nonShortedQuantity) {
              validationResults.push({
                productId: item.productId,
                isValid: false,
                errorType: 'quantity_mismatch',
                errorMessage: `Component ${scannedEan} scanned too many times (${count} > ${nonShortedQuantity})`,
                expectedQuantity: expectedTotalScans,
                scannedQuantity: item.eans.length,
                productName: orderItem.name,
              });
              hasAnyError = true;
              eanError = true;
              break;
            }
          }
        }
      } else {
        for (const ean of item.eans) {
          if (ean !== orderItem.ean) {
            validationResults.push({
              productId: item.productId,
              isValid: false,
              errorType: 'ean_mismatch',
              errorMessage: `EAN ${ean} does not match expected EAN ${orderItem.ean}`,
              expectedQuantity: expectedTotalScans,
              scannedQuantity: item.eans.length,
              productName: orderItem.name,
            });
            hasAnyError = true;
            eanError = true;
            break;
          }
        }
      }

      if (!eanError) {
        validationResults.push({
          productId: item.productId,
          isValid: true,
          expectedQuantity: expectedTotalScans,
          scannedQuantity: item.eans.length,
          productName: orderItem.name,
        });
      }
    }

    if (!hasAnyError) {
      const updatedItems = packingOrder.items.map((i: any) => {
        const scanned = items.find((s) => s.productId === i.productId);
        return scanned ? { ...i, scannedCount: scanned.eans.length } : i;
      });
      await this.packingOrderCrud.update(packingOrderId, {
        items: updatedItems,
      });
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
    this.scanLogger.logEvidenceRequest({
      packingOrderId,
      imageCount: imageUrls.length,
      boxCode,
    });

    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);
    if (!packingOrder) {
      throw new Error('Packing order not found');
    }

    if (packingOrder.assignedTo !== packerId) {
      throw new Error('This order is no longer assigned to you');
    }

    const evidence = await this.evidenceCrud.create({
      packingOrderId,
      packerId,
      prePackImages: imageUrls,
      postPackImages: [],
      actualBox: { code: boxCode, dimensions: { l: 0, w: 0, h: 0 } },
      uploadedAt: new Date(),
    });

    this.packingLogger.logEvidenceUploaded(packingOrderId, imageUrls.length);
    this.scanLogger.logEvidenceResponse(
      packingOrderId,
      evidence._id?.toString(),
    );

    return this.packingOrderCrud.findById(packingOrderId);
  }

  async completePacking(
    packingOrderId: string,
    packerId: string,
    provider?: string,
    serviceType?: string,
  ): Promise<any> {
    this.scanLogger.logCompletePackingRequest(packingOrderId);

    const packingOrder = await this.packingOrderCrud.findById(packingOrderId);

    if (!packingOrder) {
      this.scanLogger.logScanError(
        'completePacking',
        packingOrderId,
        new Error('Packing order not found'),
      );
      throw new Error('Packing order not found');
    }

    if (packingOrder.assignedTo !== packerId) {
      this.scanLogger.logScanError(
        'completePacking',
        packingOrderId,
        new Error('Order not assigned to this packer'),
      );
      throw new Error('This order is no longer assigned to you');
    }

    this.scanLogger.logCompletePackingStep('ORDER_FOUND', {
      packingOrderId,
      orderId: packingOrder.orderId,
      assignedTo: packingOrder.assignedTo,
      status: packingOrder.status,
    });

    const settings = await this.settingsService.getGlobalSettings();
    if (!settings.isPackerScanBypassEnabled) {
      const hasSuccessfulScan =
        await this.scanLogCrud.hasSuccessfulBatchScan(packingOrderId);

      if (!hasSuccessfulScan) {
        this.scanLogger.logScanError(
          'completePacking',
          packingOrderId,
          new Error('No successful batch scan found'),
        );
        throw new Error(
          'Cannot complete packing: No successful batch scan found for this order',
        );
      }

      this.scanLogger.logCompletePackingStep('BATCH_SCAN_VERIFIED', {
        packingOrderId,
        hasSuccessfulScan: true,
      });
    } else {
      this.scanLogger.logCompletePackingStep('BATCH_SCAN_BYPASSED', {
        packingOrderId,
        scanBypassEnabled: true,
      });
    }

    const isPartiallyFulfilled = packingOrder.items.some(
      (item: any) => (item.shortCount || 0) > 0
    );

    await this.packingLifecycle.completePacking(packingOrderId, isPartiallyFulfilled);

    this.scanLogger.logCompletePackingStep('STATUS_COMPLETED', {
      packingOrderId,
      isPartiallyFulfilled,
    });

    await this.orderRepository.updateOrderStatus(
      packingOrder.orderId,
      OrderStatus.PACKED,
    );

    this.scanLogger.logCompletePackingStep('ORDER_STATUS_PACKED', {
      packingOrderId,
      orderId: packingOrder.orderId,
    });

    const duration = this.calculatePackingDuration(
      packingOrder.packingStartedAt,
    );

    this.packingLogger.logPackingCompleted(
      packingOrderId,
      packingOrder.assignedTo,
      duration,
    );

    this.scanLogger.logCompletePackingStep('SHIPMENT_INITIATION', {
      orderId: packingOrder.orderId,
    });

    // Subtract stock for each item actually packed
    try {
      for (const item of packingOrder.items) {
        const qtyToDeduct = item.scannedCount || 0;
        if (qtyToDeduct > 0) {
          await this.inventoryService.adjustStockByIdentifier(
            item.sku,
            -qtyToDeduct,
            InventoryAction.ORDER_PACKED,
            {
              referenceId: packingOrder.orderId,
              performedBy: packerId,
              notes: `Auto-subtracted during packing of order ${packingOrder.orderId}`,
            },
          );
        }
      }
      this.scanLogger.logCompletePackingStep('STOCK_SUBTRACTED', {
        packingOrderId,
        orderId: packingOrder.orderId,
      });
    } catch (stockError) {
      this.scanLogger.logScanError(
        'completePacking',
        packingOrderId,
        new Error(`Stock subtraction failed: ${stockError.message}`),
      );
      // We don't throw here to avoid blocking the shipment process, but we log the error
    }

    try {
      if (provider) {
        await this.initiateShipmentCreation(
          packingOrder.orderId,
          packingOrderId,
          serviceType,
          provider,
        );
      } else {
        this.scanLogger.logCompletePackingStep('SHIPMENT_SKIPPED', {
          packingOrderId,
          reason: 'No provider specified (auto-complete packing)',
        });
      }
    } catch (shipmentError) {
      this.scanLogger.logCompletePackingStep('SHIPMENT_SKIPPED', {
        packingOrderId,
        reason: shipmentError.message,
      });
    }

    const result = await this.packingOrderCrud.findById(packingOrderId);

    this.scanLogger.logCompletePackingResponse(packingOrderId, {
      status: result?.status,
      durationMinutes: duration,
    });

    return result;
  }

  async adminPunchShipment(input: AdminPunchShipmentInput): Promise<any> {
    const { orderId, serviceType, provider, pickupLocationName } = input;

    this.packingLogger.logInfo('Admin punch shipment initiated', {
      orderId,
      provider,
      pickupLocationName,
    });

    let packingOrder = await this.packingOrderCrud.findOne({ orderId });

    if (!packingOrder) {
      this.packingLogger.logInfo(
        'Packing order missing, attempting to create on the fly',
        { orderId },
      );

      const order = await this.orderRepository.findByInternalId(orderId);

      if (!order) {
        this.packingLogger.logError(
          'Order not found for admin punch',
          new Error('Order not found'),
          { orderId },
        );
        throw new Error('Order not found');
      }

      packingOrder = await this.packingOrderCreator.createFromOrder(order);
      this.packingLogger.logInfo(
        'Packing order created on the fly for admin punch',
        {
          orderId: order._id.toString(),
          packingOrderId: (packingOrder as any)._id.toString(),
        },
      );
    }

    if (!packingOrder) {
      throw new Error('Failed to ensure packing order exists');
    }

    this.packingLogger.logInfo('Packing order found for admin punch', {
      orderId,
      packingOrderId: packingOrder._id?.toString(),
      status: packingOrder.status,
    });

    const packingOrderId = packingOrder._id.toString();

    await this.packingOrderCrud.update(packingOrderId, {
      status: PackingStatus.COMPLETED,
      packingCompletedAt: new Date(),
    });

    await this.orderRepository.updateStatusByInternalId(
      packingOrder.orderId,
      OrderStatus.PACKED,
    );

    await this.initiateShipmentCreation(
      packingOrder.orderId,
      packingOrderId,
      serviceType,
      provider,
      pickupLocationName,
    );

    return this.packingOrderCrud.findById(packingOrderId);
  }

  async syncTerminalOrderStatus(
    orderId: string,
    status: OrderStatus | string,
  ): Promise<void> {
    const terminalStatuses: string[] = [
      OrderStatus.DELIVERED,
      OrderStatus.SHIPPED,
      OrderStatus.PACKED,
      'CANCELLED',
      'RTO',
      'RTO_DELIVERED',
    ];

    if (!terminalStatuses.includes(status)) {
      return;
    }

    const packingOrder = await this.packingOrderCrud.findOne({ orderId });
    if (!packingOrder) {
      return;
    }

    if (
      packingOrder.status === PackingStatus.PENDING ||
      packingOrder.status === PackingStatus.ASSIGNED ||
      packingOrder.status === PackingStatus.PACKING
    ) {
      await this.packingOrderCrud.update(packingOrder._id.toString(), {
        status: PackingStatus.COMPLETED,
        packingCompletedAt: new Date(),
      });

      this.packingLogger.logInfo(
        'Synced terminal order status to PackingOrder',
        {
          orderId,
          packingOrderId: packingOrder._id.toString(),
          newOrderStatus: status,
        },
      );

      try {
        await this.packingQueue.removeFromQueue(orderId);
      } catch (err) { }
    }
  }

  private resolvePhone(order: any, address: any): string | null {
    const isValid = (p?: string) => p && p !== 'N/A';
    const raw =
      (isValid(order?.recipientContact?.phone) &&
        order.recipientContact.phone) ||
      (isValid(address?.recipientPhone) && address.recipientPhone) ||
      null;
    if (!raw) return null;
    const normalized = raw.replace(/^\+/, '');
    return normalized.length === 10 ? `91${normalized}` : normalized;
  }

  private calculatePackingDuration(packingStartedAt?: Date): number {
    return packingStartedAt
      ? Math.floor((Date.now() - packingStartedAt.getTime()) / 60000)
      : 0;
  }

  private async initiateShipmentCreation(
    orderId: string,
    packingOrderId: string,
    serviceType?: string,
    provider?: string,
    pickupLocationName?: string,
  ): Promise<any> {
    try {
      const order = await this.orderRepository.findByInternalId(orderId);

      let packingEvidence = await this.packingEvidenceModel
        .findOne({ packingOrderId })
        .exec();

      // Check if shipment already exists for this order
      const existingShipments =
        await this.shipmentService.findByOrderId(orderId);
      if (existingShipments && existingShipments.length > 0) {
        this.shipmentLogger.logInfo('Shipment already exists for order', {
          orderId,
          shipmentId: existingShipments[0]._id.toString(),
          awbNumber: existingShipments[0].dtdcAwbNumber,
        });

        const existingAddress = order?.shippingAddressId
          ? await this.addressModel.findById(order.shippingAddressId).exec()
          : null;
        const phoneNumber = this.resolvePhone(order, existingAddress);
        if (!phoneNumber || !order) {
          this.shipmentLogger.logInfo(
            'No phone number found for order, skipping WhatsApp notification',
            { orderId },
          );
          return existingShipments[0];
        }
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
        const trackingUrl = `https://letstryfoods.com/track/${existingShipments[0].dtdcAwbNumber}`;

        await this.whatsappQueue.add('order-packed', {
          phoneNumber,
          orderId,
          orderDate,
          trackingUrl,
        });

        this.shipmentLogger.logInfo(
          'WhatsApp notification queued for order packed (existing shipment)',
          {
            orderId,
            awbNumber: existingShipments[0].dtdcAwbNumber,
            phoneNumber,
          },
        );

        return existingShipments[0];
      }

      const shippingAddress = order?.shippingAddressId
        ? await this.addressModel.findById(order.shippingAddressId).exec()
        : null;

      if (!order || !shippingAddress) {
        this.shipmentLogger.logError(
          'Missing data for shipment creation',
          new Error('Incomplete data'),
          {
            orderId,
            packingOrderId,
            orderFound: !!order,
            addressFound: !!shippingAddress,
            shippingAddressId: order?.shippingAddressId,
          },
        );
        return;
      }

      let boxDimensions: any;
      let totalWeight = 0;

      if (packingEvidence) {
        boxDimensions =
          packingEvidence.actualBox?.dimensions ||
          packingEvidence.recommendedBox?.dimensions;
        totalWeight =
          order.items.reduce(
            (sum: number, item: any) =>
              sum + (item.dimensions?.weight || 0) * item.quantity,
            0,
          ) / 1000;
      } else {
        const packingOrder =
          await this.packingOrderCrud.findById(packingOrderId);
        if (packingOrder) {
          const recommendedBox = await this.boxRecommendation.selectOptimalBox(
            packingOrder.items,
          );
          boxDimensions = recommendedBox?.internalDimensions;
          totalWeight =
            packingOrder.items.reduce(
              (sum: number, item: any) =>
                sum + (item.dimensions?.weight || 0) * item.quantity,
              0,
            ) / 1000;
        }
      }

      if (!boxDimensions) {
        this.shipmentLogger.logError(
          'No box dimensions found',
          new Error('Missing dimensions'),
          {
            orderId,
            packingOrderId,
          },
        );
        await this.orderRepository.updateStatusByInternalId(
          orderId,
          OrderStatus.SHIPMENT_FAILED,
        );
        return;
      }

      totalWeight = Math.max(totalWeight, 0.5);

      const shipmentPayload = this.buildShipmentPayload(
        orderId,
        order,
        boxDimensions,
        shippingAddress,
        totalWeight,
        serviceType,
        provider,
        pickupLocationName,
      );
      const shipmentResult =
        await this.shipmentService.createShipment(shipmentPayload);

      const phoneNumber = this.resolvePhone(order, shippingAddress);
      if (!phoneNumber) {
        this.shipmentLogger.logInfo(
          'No phone number found for order, skipping WhatsApp notification',
          { orderId },
        );
        return shipmentResult;
      }
      const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN');
      const trackingUrl = `https://letstryfoods.com/track/${shipmentResult.awbNumber}`;

      await this.whatsappQueue.add('order-packed', {
        phoneNumber,
        orderId,
        orderDate,
        trackingUrl,
      });

      this.shipmentLogger.logInfo(
        'WhatsApp notification queued for order packed',
        {
          orderId,
          awbNumber: shipmentResult.awbNumber,
          phoneNumber,
        },
      );

      return shipmentResult;
    } catch (error) {
      this.shipmentLogger.logError('Failed to create shipment', error, {
        orderId,
        packingOrderId,
      });
      try {
        await this.orderRepository.updateStatusByInternalId(
          orderId,
          OrderStatus.SHIPMENT_FAILED,
        );
      } catch (_) { }
      throw error;
    }
  }

  private buildShipmentPayload(
    orderId: string,
    order: any,
    boxDimensions: any,
    shippingAddress: any,
    weight: number,
    serviceType?: string,
    provider?: string,
    pickupLocationName?: string,
  ) {
    return {
      orderId,
      provider,
      pickupLocationName,
      orderNumber: order.orderId,
      serviceType:
        serviceType ||
        this.configService.get('dtdc.defaults.serviceType') ||
        'GROUND EXPRESS',
      loadType:
        this.configService.get('dtdc.defaults.loadType') || 'NON-DOCUMENT',
      weight,
      declaredValue: parseFloat(order.totalAmount) || 0,
      numPieces: 1,
      dimensions: {
        length: boxDimensions.l,
        width: boxDimensions.w,
        height: boxDimensions.h,
      },
      originDetails: {
        name: this.configService.get('dtdc.origin.name'),
        phone: this.configService.get('dtdc.origin.phone'),
        alternatePhone: this.configService.get('WAREHOUSE_ALT_PHONE'),
        addressLine1: this.configService.get('dtdc.origin.addressLine1'),
        addressLine2: this.configService.get('dtdc.origin.addressLine2'),
        pincode: this.configService.get('dtdc.origin.pincode'),
        city: this.configService.get('dtdc.origin.city'),
        state: this.configService.get('dtdc.origin.state'),
        latitude: this.configService.get('WAREHOUSE_LATITUDE'),
        longitude: this.configService.get('WAREHOUSE_LONGITUDE'),
      },
      destinationDetails: {
        name: shippingAddress.recipientName,
        phone: shippingAddress.recipientPhone,
        alternatePhone: undefined,
        addressLine1:
          shippingAddress.buildingName +
          (shippingAddress.floor ? `, Floor ${shippingAddress.floor}` : ''),
        addressLine2: [shippingAddress.streetArea, shippingAddress.landmark]
          .filter(Boolean)
          .join(', '),
        pincode: shippingAddress.postalCode,
        city: shippingAddress.addressLocality,
        state: shippingAddress.addressRegion,
        latitude: shippingAddress.latitude?.toString(),
        longitude: shippingAddress.longitude?.toString(),
      },
      codAmount:
        order.metadata?.paymentMethod === 'COD'
          ? parseFloat(order.totalAmount)
          : undefined,
      codCollectionMode:
        order.metadata?.paymentMethod === 'COD' ? 'CASH' : undefined,
      invoiceNumber: order.orderId,
      invoiceDate: order.createdAt,
      commodityId: this.configService.get('dtdc.defaults.commodityId') || '10',
      description: 'Food Products',
      isRiskSurchargeApplicable: false,
    };
  }

  async getBoxRecommendation(packingOrderId: string): Promise<any> {
    const order = await this.packingOrderCrud.findById(packingOrderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return this.boxRecommendation.selectOptimalBox(order.items);
  }

  async getBoxByCode(code: string): Promise<any> {
    return this.boxRecommendation.getBoxByCode(code);
  }

  async getMostUsedRecommendedBox(): Promise<string | undefined> {
    const recentOrders = await this.packingOrderCrud.findRecent(200);
    if (!recentOrders || recentOrders.length === 0) return undefined;

    const boxCounts: Record<string, number> = {};
    for (const order of recentOrders) {
      if (!order.items || order.items.length === 0) continue;
      try {
        const recommendedBox = await this.boxRecommendation.selectOptimalBox(
          order.items,
        );
        if (recommendedBox?.code) {
          boxCounts[recommendedBox.code] =
            (boxCounts[recommendedBox.code] || 0) + 1;
        }
      } catch {
        // ignore if optimal box cannot be calculated
      }
    }

    let mostUsed: string | undefined = undefined;
    let max = 0;
    for (const [code, count] of Object.entries(boxCounts)) {
      if (count > max) {
        max = count;
        mostUsed = code;
      }
    }

    return mostUsed;
  }

  async getAllPackingOrders(filters: {
    packerId?: string;
    status?: string;
  }): Promise<any[]> {
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
    const evidence = await this.evidenceCrud.findByOrder(packingOrderId);
    if (!evidence) return null;

    // Auto-migrate any base64 images to R2 and update DB
    const isBase64 = (str: string) =>
      str.length > 500 && (str.startsWith('/9j/') || str.startsWith('iVBOR') || str.startsWith('data:image'));

    const migrateImages = async (images: string[]): Promise<string[]> => {
      return Promise.all(
        images.map(async (img) => {
          if (!isBase64(img)) return img; // already a key or URL, skip
          try {
            // Strip data URI prefix if present
            const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            const key = `${crypto.randomBytes(16).toString('hex')}.jpg`;
            const bucket = this.uploadService.getBucketName();
            const s3 = this.uploadService.getS3Client();
            const { PutObjectCommand } = await import('@aws-sdk/client-s3');
            await s3.send(
              new PutObjectCommand({
                Bucket: bucket,
                Key: key,
                Body: buffer,
                ContentType: 'image/jpeg',
                CacheControl: 'public, max-age=31536000',
              }),
            );
            return key;
          } catch (e) {
            return img; // fallback: return original if migration fails
          }
        }),
      );
    };

    let changed = false;
    const newPrePack = await migrateImages(evidence.prePackImages || []);
    const newPostPack = await migrateImages(evidence.postPackImages || []);

    if (JSON.stringify(newPrePack) !== JSON.stringify(evidence.prePackImages)) changed = true;
    if (JSON.stringify(newPostPack) !== JSON.stringify(evidence.postPackImages)) changed = true;

    if (changed) {
      await this.evidenceCrud.update(evidence._id.toString(), {
        prePackImages: newPrePack,
        postPackImages: newPostPack,
      });
      evidence.prePackImages = newPrePack;
      evidence.postPackImages = newPostPack;
    }

    return evidence;
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
  async getPackingDetailsByOrderId(
    orderId: string,
  ): Promise<{ packingOrder: any; evidence: any } | null> {
    const packingOrder = await this.packingOrderCrud.findOne({ orderId });
    if (!packingOrder) return null;

    const evidence = await this.evidenceCrud.findByOrder(
      packingOrder._id.toString(),
    );
    return { packingOrder, evidence };
  }

  async calculateWeightAndBoxFromOrder(
    order: any,
  ): Promise<{ weight: number; boxDimensions: any } | null> {
    try {
      const items = await this.packingOrderCreator.extractItemsForOrder(order);
      const totalWeight = Math.max(
        items.reduce(
          (sum, item) => sum + (item.dimensions?.weight || 0) * item.quantity,
          0,
        ) / 1000,
        0.5,
      );
      const recommendedBox =
        await this.boxRecommendation.selectOptimalBox(items);
      const boxDimensions = recommendedBox?.internalDimensions || null;
      return { weight: totalWeight, boxDimensions };
    } catch {
      return null;
    }
  }

  async calculateShipmentWeight(
    order: any,
    packingOrder: any,
    evidence: any,
  ): Promise<{ weight: number; boxDimensions: any } | null> {
    let boxDimensions: any;
    let totalWeight = 0;

    if (evidence) {
      boxDimensions =
        evidence.actualBox?.dimensions || evidence.recommendedBox?.dimensions;
      totalWeight =
        order.items.reduce(
          (sum: number, item: any) =>
            sum + (item.dimensions?.weight || 0) * item.quantity,
          0,
        ) / 1000;
    } else if (packingOrder) {
      totalWeight =
        packingOrder.items.reduce(
          (sum: number, item: any) =>
            sum + (item.dimensions?.weight || 0) * item.quantity,
          0,
        ) / 1000;

      try {
        const recommendedBox = await this.boxRecommendation.selectOptimalBox(
          packingOrder.items,
        );
        boxDimensions = recommendedBox?.internalDimensions || null;
      } catch {
        boxDimensions = null;
      }
    }

    totalWeight = Math.max(totalWeight, 0.5);

    return {
      weight: totalWeight,
      boxDimensions: boxDimensions || null,
    };
  }
  async getPackerHistory(packerId: string): Promise<any[]> {
    const orders = await this.packingOrderCrud.findByPacker(packerId);
    const completed = orders.filter(
      (order: any) => order.status === 'completed' || order.status === 'partially_fulfilled'
    );

    // Attach evidence (photos) to each order
    const withEvidence = await Promise.all(
      completed.map(async (order: any) => {
        const evidence = await this.evidenceCrud.findByOrder(order._id.toString());
        return {
          ...order.toObject ? order.toObject() : order,
          evidence: evidence
            ? {
              prePackImages: (evidence.prePackImages || []).map((img: string) => {
                // If already a CDN key (not base64), build full URL
                if (img.length < 500) {
                  return `${this.configService.get<string>('aws.cloudfrontDomain')?.replace(/\/$/, '')}/${img}`;
                }
                return img; // return raw base64 as-is for app (it can display it directly)
              }),
            }
            : null,
        };
      }),
    );

    return withEvidence;
  }

  isDelhiNCR(address: any): boolean {
    if (!address) return false;
    const pincode = (address.postalCode || address.pincode || '')
      .toString()
      .trim();

    // Delhi NCR Pincode Prefixes:
    // 11: Delhi
    // 121, 122: Faridabad, Gurgaon
    // 201: Noida, Ghaziabad
    const ncrPrefixes = ['11', '121', '122', '201'];
    return ncrPrefixes.some((prefix) => pincode.startsWith(prefix));
  }

  async getDeliveryRecommendation(
    orderId: string,
  ): Promise<{ recommendedProvider: string; reason: string }> {
    const order = await this.orderRepository.findByInternalId(orderId);
    if (!order)
      return { recommendedProvider: 'DTDC', reason: 'Order not found' };

    const address = order.shippingAddressId
      ? await this.addressModel.findById(order.shippingAddressId).exec()
      : null;

    if (this.isDelhiNCR(address)) {
      return {
        recommendedProvider: 'SHIPROCKET',
        reason: 'Local NCR region - Shiprocket is faster',
      };
    }

    return {
      recommendedProvider: 'DTDC',
      reason: 'Outside NCR region - DTDC has better reach',
    };
  }

  async getShippingInfo(orderId: string): Promise<any> {
    try {
      const order = await this.orderRepository.findByInternalId(orderId);
      if (!order || !order.shippingAddressId) return null;
      const address = await this.addressModel.findById(order.shippingAddressId).exec();
      if (!address) return null;

      const addressLine1 = address.buildingName + (address.floor ? `, Floor ${address.floor}` : '');
      const addressLine2 = [address.streetArea, address.landmark].filter(Boolean).join(', ');

      return {
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        addressLine1,
        addressLine2,
        city: address.addressLocality,
        pincode: address.postalCode,
        state: address.addressRegion,
      };
    } catch (err) {
      return null;
    }
  }

  async getShipmentInfo(orderId: string): Promise<any> {
    try {
      const shipments = await this.shipmentService.findByOrderId(orderId);
      if (!shipments || shipments.length === 0) return null;
      const sh = shipments[0];
      return {
        awbNumber: sh.awbNumber || sh.dtdcAwbNumber,
        provider: sh.provider,
      };
    } catch (err) {
      return null;
    }
  }
}
