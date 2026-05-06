import { Injectable } from '@nestjs/common';
import { IDeliveryPartnerAdapter } from '../../adapters/interface/delivery-partner.adapter.interface';
import { DtdcAdapter } from '../../adapters/dtdc/dtdc.adapter';
import { ShiprocketAdapter } from '../../adapters/shiprocket/shiprocket.adapter';

@Injectable()
export class DeliveryPartnerFactory {
  constructor(
    private readonly dtdcAdapter: DtdcAdapter,
    private readonly shiprocketAdapter: ShiprocketAdapter,
  ) {}

  getAdapter(provider: 'DTDC' | 'SHIPROCKET'): IDeliveryPartnerAdapter {
    if (provider === 'SHIPROCKET') {
      return this.shiprocketAdapter;
    }
    return this.dtdcAdapter;
  }
}
