import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ShipmentTrackingHistory } from '../entities/shipment-tracking-history.entity';
import { ShipmentStatusMapperService } from './shipment-status-mapper.service';
import { DtdcWebhookPayload, DtdcTrackingResponse } from '../interfaces/dtdc-payload.interface';

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectModel(ShipmentTrackingHistory.name)
    private readonly trackingHistoryModel: Model<ShipmentTrackingHistory>,
    private readonly statusMapper: ShipmentStatusMapperService,
  ) { }

  async addTrackingEvent(
    shipmentId: string,
    statusData: DtdcWebhookPayload['shipmentStatus'][0],
  ): Promise<any> {
    const actionDate = this.parseDtdcDate(statusData.strActionDate);
    const actionTime = this.parseDtdcTime(statusData.strActionTime);
    const actionDatetime = this.combineDateAndTime(
      statusData.strActionDate,
      statusData.strActionTime,
    );

    const trackingEvent = await this.trackingHistoryModel.create({
      shipmentId: new Types.ObjectId(shipmentId),
      statusCode: statusData.strAction,
      statusDescription: statusData.strActionDesc,
      location: statusData.strOrigin,
      manifestNumber: statusData.strManifestNo,
      actionDate,
      actionTime,
      actionDatetime,
      remarks: statusData.strRemarks,
      latitude: this.parseCoordinate(statusData.strLatitude),
      longitude: this.parseCoordinate(statusData.strLongitude),
      scdOtp: this.statusMapper.parseOtpFlag(statusData.strSCDOTP),
      ndcOtp: this.statusMapper.parseOtpFlag(statusData.strNDCOTP),
      rawPayload: statusData,
    } as any);

    return trackingEvent;
  }

  async syncTrackingData(
    shipmentId: string,
    trackDetails: DtdcTrackingResponse['trackDetails'],
  ): Promise<any[]> {
    if (!trackDetails || !trackDetails.length) return [];

    const newEvents: any[] = [];

    // Sort by chronological order just in case
    const sortedDetails = [...trackDetails].sort((a, b) => {
      const dateA = this.combineDateAndTime(a.strActionDate, a.strActionTime);
      const dateB = this.combineDateAndTime(b.strActionDate, b.strActionTime);
      return dateA.getTime() - dateB.getTime();
    });

    for (const detail of sortedDetails) {
      const actionDate = this.parseDtdcDate(detail.strActionDate);
      const actionTime = this.parseDtdcTime(detail.strActionTime);
      const actionDatetime = this.combineDateAndTime(
        detail.strActionDate,
        detail.strActionTime,
      );

      // DTDC API is sometimes loose with exact seconds, so we check for same code + location
      const existing = await this.trackingHistoryModel.findOne({
        shipmentId: new Types.ObjectId(shipmentId),
        statusCode: detail.strCode,
        actionDate: actionDate,
        actionTime: actionTime,
      });

      if (!existing) {
        const trackingEvent = await this.trackingHistoryModel.create({
          shipmentId: new Types.ObjectId(shipmentId),
          statusCode: detail.strCode,
          statusDescription: detail.strAction,
          location: detail.strOrigin,
          manifestNumber: detail.strManifestNo,
          actionDate,
          actionTime,
          actionDatetime,
          remarks: detail.sTrRemarks,
          latitude: this.parseCoordinate(detail.strLatitude),
          longitude: this.parseCoordinate(detail.strLongitude),
          scdOtp: this.statusMapper.parseOtpFlag(detail.strSCDOTP),
          ndcOtp: this.statusMapper.parseOtpFlag(detail.strNDCOTP),
          rawPayload: detail,
        } as any);
        newEvents.push(trackingEvent);
      }
    }

    return newEvents;
  }

  async getShipmentTimeline(
    shipmentId: string,
  ): Promise<any[]> {
    return this.trackingHistoryModel
      .find({ shipmentId: new Types.ObjectId(shipmentId) })
      .sort({ actionDatetime: -1 })
      .exec();
  }

  async getLatestStatus(
    shipmentId: string,
  ): Promise<any | null> {
    return this.trackingHistoryModel
      .findOne({ shipmentId: new Types.ObjectId(shipmentId) })
      .sort({ actionDatetime: -1 })
      .exec();
  }

  private parseDtdcDate(dateStr: string): Date {
    if (!dateStr || dateStr.length !== 8) {
      return new Date();
    }

    const day = dateStr.substring(0, 2);
    const month = dateStr.substring(2, 4);
    const year = dateStr.substring(4, 8);

    return new Date(`${year}-${month}-${day}`);
  }

  private parseDtdcTime(timeStr: string): string {
    if (!timeStr || timeStr.length < 4) {
      return '00:00:00';
    }

    const hours = timeStr.substring(0, 2);
    const minutes = timeStr.substring(2, 4);
    const seconds = timeStr.length >= 6 ? timeStr.substring(4, 6) : '00';

    return `${hours}:${minutes}:${seconds}`;
  }

  private combineDateAndTime(dateStr: string, timeStr: string): Date {
    const date = this.parseDtdcDate(dateStr);
    const time = this.parseDtdcTime(timeStr);
    const [hours, minutes, seconds] = time.split(':');

    date.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));

    return date;
  }

  private parseCoordinate(coord: string): number | null {
    if (!coord) return null;
    const parsed = parseFloat(coord);
    return isNaN(parsed) ? null : parsed;
  }
}
