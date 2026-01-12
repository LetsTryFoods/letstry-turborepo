import { Injectable } from '@nestjs/common';
import {
  DTDC_STATUS_CODES,
  DTDC_NON_DELIVERY_REASONS,
  DELIVERY_STATUS_CODES,
  FAILED_DELIVERY_CODES,
  RTO_STATUS_CODES,
  IN_TRANSIT_CODES,
  CANCELLED_CODES,
} from '../constants/dtdc-status-codes';

@Injectable()
export class ShipmentStatusMapperService {
  getStatusDescription(statusCode: string): string {
    return DTDC_STATUS_CODES[statusCode] || statusCode;
  }

  parseNonDeliveryReason(remarks: string): string {
    if (!remarks) return '';

    const parts = remarks.split('|');
    if (parts.length < 2) return remarks;

    const reasonCode = parts[0];
    return DTDC_NON_DELIVERY_REASONS[reasonCode] || remarks;
  }

  isDelivered(statusCode: string): boolean {
    return DELIVERY_STATUS_CODES.includes(statusCode);
  }

  isFailedDelivery(statusCode: string): boolean {
    return FAILED_DELIVERY_CODES.includes(statusCode);
  }

  isRto(statusCode: string): boolean {
    return RTO_STATUS_CODES.includes(statusCode);
  }

  isInTransit(statusCode: string): boolean {
    return IN_TRANSIT_CODES.includes(statusCode);
  }

  isCancelled(statusCode: string): boolean {
    return CANCELLED_CODES.includes(statusCode);
  }

  parseOtpFlag(flag: string | undefined): boolean | null {
    if (!flag) return null;
    return flag.toUpperCase() === 'Y';
  }
}
