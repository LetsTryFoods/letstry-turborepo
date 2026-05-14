import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  QRScanDataDoc,
  QRScanDataDocument,
  QRTotalScanDoc,
  QRTotalScanDocument,
  QRUniqueScanDoc,
  QRUniqueScanDocument,
  QRAnalyticsSummary,
  OSSplit,
  QRScanItem,
} from './analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(QRScanDataDoc.name)
    private scanDataModel: Model<QRScanDataDocument>,
    @InjectModel(QRTotalScanDoc.name)
    private totalScanModel: Model<QRTotalScanDocument>,
    @InjectModel(QRUniqueScanDoc.name)
    private uniqueScanModel: Model<QRUniqueScanDocument>,
  ) {}

  private mapOSSplit(rawSplit?: Record<string, number>): OSSplit {
    const split: OSSplit = {
      android: 0,
      ios: 0,
      windows: 0,
      macOS: 0,
      other: 0,
    };

    if (!rawSplit) return split;

    for (const [key, val] of Object.entries(rawSplit)) {
      const lower = key.toLowerCase();
      if (lower.includes('android')) {
        split.android += val;
      } else if (
        lower.includes('ios') ||
        lower.includes('iphone') ||
        lower.includes('ipad')
      ) {
        split.ios += val;
      } else if (lower.includes('windows')) {
        split.windows += val;
      } else if (lower.includes('mac')) {
        split.macOS += val;
      } else {
        split.other += val;
      }
    }

    return split;
  }

  async getAnalyticsSummary(): Promise<QRAnalyticsSummary> {
    const totalDoc = await this.totalScanModel
      .findOne({ qr_id: 'default_qr' })
      .lean()
      .exec();

    const uniqueDoc = await this.uniqueScanModel
      .findOne({ qr_id: 'default_qr' })
      .lean()
      .exec();

    const rawScans = await this.scanDataModel
      .find()
      .sort({ _id: -1 })
      .limit(50)
      .lean()
      .exec();

    const totalScans = totalDoc ? totalDoc.total_scans || 0 : 0;
    const uniqueScans = uniqueDoc ? uniqueDoc.unique_scans || 0 : 0;

    const totalOSSplit = this.mapOSSplit(totalDoc?.os_split);
    const uniqueOSSplit = this.mapOSSplit(uniqueDoc?.os_split);

    const recentScans: QRScanItem[] = rawScans.map((doc: any) => ({
      fingerprint: doc.fingerprint || 'unknown',
      device: doc.device || 'pc',
      os: doc.os || 'Unknown',
      userAgent: doc.user_agent || '',
      ipAddress: doc.ip_address || '',
      location: doc.location || '',
      timesScanned: doc.times_scanned || 1,
      dateTime: Array.isArray(doc.date_time) ? doc.date_time : [],
    }));

    return {
      totalScans,
      uniqueScans,
      totalOSSplit,
      uniqueOSSplit,
      recentScans,
    };
  }
}
