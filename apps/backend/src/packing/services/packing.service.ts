import { Injectable } from '@nestjs/common';
import { OrderAssignmentService } from './domain/order-assignment.service';
import { PackingQueueService } from './domain/packing-queue.service';
import { ScanValidationService } from './domain/scan-validation.service';
import { ScanLogCrudService } from './core/scan-log-crud.service';
import { EvidenceUploadService } from './domain/evidence-upload.service';
import { EvidenceCrudService } from './core/evidence-crud.service';
import { PackingLifecycleService } from './domain/packing-lifecycle.service';
import { PackingOrderCrudService } from './core/packing-order-crud.service';
import { BoxRecommendationService } from '../../box-size/services/domain/box-recommendation.service';
import { PackingLoggerService } from './domain/packing-logger.service';
import { OrderStatus } from '../../order/order.schema';
import { PackingOrderCreatorService } from './domain/packing-order-creator.service';
import { Order } from '../../order/order.schema';
import { OrderRepository } from '../../order/services/order.repository';

@Injectable()
export class PackingService {
  constructor(
    private readonly orderAssignment: OrderAssignmentService,
    private readonly packingQueue: PackingQueueService,
    private readonly scanValidation: ScanValidationService,
    private readonly scanLogCrud: ScanLogCrudService,
    private readonly evidenceUpload: EvidenceUploadService,
    private readonly evidenceCrud: EvidenceCrudService,
    private readonly packingLifecycle: PackingLifecycleService,
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly boxRecommendation: BoxRecommendationService,
    private readonly packingLogger: PackingLoggerService,
    private readonly orderRepository: OrderRepository,
    private readonly packingOrderCreator: PackingOrderCreatorService,
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
    // We assume images are already uploaded via presigned URLs
    // imageUrls contains the keys or full URLs

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

    const duration = packingOrder.packingStartedAt
      ? Math.floor(
        (Date.now() - packingOrder.packingStartedAt.getTime()) / 60000,
      )
      : 0;

    this.packingLogger.logPackingCompleted(
      packingOrderId,
      packingOrder.assignedTo,
      duration,
    );

    return this.packingOrderCrud.findById(packingOrderId);
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
