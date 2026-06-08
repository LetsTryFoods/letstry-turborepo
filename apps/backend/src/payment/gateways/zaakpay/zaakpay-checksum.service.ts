import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ZaakpayChecksumService {
  private secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>('zaakpay.secretKey')!;
  }

  generateChecksum(data: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }

  verifyChecksum(data: string, receivedChecksum: string): boolean {
    const calculatedChecksum = this.generateChecksum(data);
    return calculatedChecksum === receivedChecksum;
  }
}
