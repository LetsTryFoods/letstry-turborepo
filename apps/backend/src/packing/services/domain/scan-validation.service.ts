import { Injectable } from '@nestjs/common';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { ScanLogCrudService } from '../core/scan-log-crud.service';
import { ScanErrorType } from '../../../common/enums/scan-error-type.enum';
import { ScanLoggerService } from './scan-logger.service';

@Injectable()
export class ScanValidationService {
  constructor(
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly scanLogCrud: ScanLogCrudService,
    private readonly scanLogger: ScanLoggerService,
  ) { }

  async validateEAN(
    orderId: string,
    ean: string,
  ): Promise<{ isValid: boolean; errorType?: string; item?: any; scannedCount: number }> {
    const order = await this.packingOrderCrud.findById(orderId);

    this.scanLogger.logValidationStep('ORDER_LOOKUP', {
      orderId,
      ean,
      orderFound: !!order,
      itemCount: order?.items?.length || 0,
      orderEans: order?.items?.map((i: any) => i.ean) || [],
    });

    if (!order)
      return { isValid: false, errorType: ScanErrorType.ITEM_NOT_FOUND, scannedCount: 0 };

    const item = order.items.find((i) => i.ean === ean);

    this.scanLogger.logValidationStep('EAN_MATCH', {
      orderId,
      scannedEan: ean,
      matched: !!item,
      matchedProductId: item?.productId || null,
      matchedSku: item?.sku || null,
      matchedName: item?.name || null,
      expectedQuantity: item?.quantity || null,
    });

    if (!item)
      return { isValid: false, errorType: ScanErrorType.ITEM_NOT_FOUND, scannedCount: 0 };

    const scannedCount = await this.scanLogCrud.countByOrderEanAndValid(
      orderId,
      ean,
      true,
    );

    this.scanLogger.logValidationStep('QUANTITY_CHECK', {
      orderId,
      ean,
      scannedCount,
      expectedQuantity: item.quantity,
      exceeded: scannedCount >= item.quantity,
    });

    if (scannedCount >= item.quantity) {
      return { isValid: false, errorType: ScanErrorType.QUANTITY_EXCEEDED, scannedCount };
    }

    return { isValid: true, item, scannedCount };
  }

  async checkQuantity(
    orderId: string,
    ean: string,
  ): Promise<{ isValid: boolean; errorType?: string }> {
    const order = await this.packingOrderCrud.findById(orderId);
    const item = order?.items.find((i) => i.ean === ean);
    if (!item)
      return { isValid: false, errorType: ScanErrorType.ITEM_NOT_FOUND };

    const scannedCount = await this.scanLogCrud.countByOrderEanAndValid(
      orderId,
      ean,
      true,
    );
    return scannedCount < item.quantity
      ? { isValid: true }
      : { isValid: false, errorType: ScanErrorType.QUANTITY_EXCEEDED };
  }

  async detectErrors(orderId: string, ean: string): Promise<string | null> {
    const validation = await this.validateEAN(orderId, ean);
    return validation.errorType || null;
  }
}
