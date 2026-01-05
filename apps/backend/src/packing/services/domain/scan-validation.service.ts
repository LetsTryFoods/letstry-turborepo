import { Injectable } from '@nestjs/common';
import { PackingOrderCrudService } from '../core/packing-order-crud.service';
import { ScanLogCrudService } from '../core/scan-log-crud.service';
import { ScanErrorType } from '../../../common/enums/scan-error-type.enum';

@Injectable()
export class ScanValidationService {
  constructor(
    private readonly packingOrderCrud: PackingOrderCrudService,
    private readonly scanLogCrud: ScanLogCrudService,
  ) { }

  async validateEAN(
    orderId: string,
    ean: string,
  ): Promise<{ isValid: boolean; errorType?: string; item?: any }> {
    const order = await this.packingOrderCrud.findById(orderId);
    if (!order)
      return { isValid: false, errorType: ScanErrorType.ITEM_NOT_FOUND };

    const item = order.items.find((i) => i.ean === ean);
    if (!item)
      return { isValid: false, errorType: ScanErrorType.ITEM_NOT_FOUND };

    const scannedCount = await this.scanLogCrud.countByOrderEanAndValid(
      orderId,
      ean,
      true,
    );
    if (scannedCount >= item.quantity) {
      return { isValid: false, errorType: ScanErrorType.QUANTITY_EXCEEDED };
    }

    return { isValid: true, item };
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
