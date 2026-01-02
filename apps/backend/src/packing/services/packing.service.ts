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
  ) {}

  async assignOrderToPacker(packerId: string): Promise<any> {
    const orderData = await this.packingQueue.getNextOrder();
    if (!orderData) return null;

    await this.orderAssignment.assignOrder(orderData.orderId, packerId);
    return this.packingOrderCrud.findById(orderData.orderId);
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
    }

    return {
      isValid: validation.isValid,
      errorType: validation.errorType,
      itemName: validation.item?.name,
    };
  }

  async uploadEvidence(
    packingOrderId: string,
    files: any[],
    boxCode: string,
  ): Promise<any> {
    const urls = await this.evidenceUpload.uploadToS3(files);

    const evidence = await this.evidenceCrud.create({
      packingOrderId,
      packerId: 'current_packer', // Get from context
      prePackImages: urls.slice(0, Math.floor(urls.length / 2)),
      postPackImages: urls.slice(Math.floor(urls.length / 2)),
      actualBox: { code: boxCode, dimensions: { l: 0, w: 0, h: 0 } }, // Get from box service
      uploadedAt: new Date(),
    });

    return evidence;
  }

  async completePacking(packingOrderId: string): Promise<any> {
    await this.packingLifecycle.completePacking(packingOrderId);
    return this.packingOrderCrud.findById(packingOrderId);
  }

  async getBoxRecommendation(packingOrderId: string): Promise<any> {
    const order = await this.packingOrderCrud.findById(packingOrderId);
    if (!order) {
      throw new Error('Order not found');
    }
    return this.boxRecommendation.selectOptimalBox(order.items);
  }
}
