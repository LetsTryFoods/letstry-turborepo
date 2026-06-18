import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BaileysMessageLog,
  BaileysMessageLogDocument,
  MessageChannel,
  MessageStatus,
} from '../schemas/baileys-message-log.schema';

export interface LogMessageInput {
  phoneNumber: string;
  recipientName?: string;
  orderId?: string;
  templateName: string;
  channel: MessageChannel;
  status: MessageStatus;
  primaryAttempted: boolean;
  primarySuccess: boolean;
  fallbackAttempted: boolean;
  fallbackSuccess: boolean;
  errorMessage?: string;
  payload: object;
}

@Injectable()
export class BaileysMessageLogService {
  constructor(
    @InjectModel(BaileysMessageLog.name)
    private logModel: Model<BaileysMessageLogDocument>,
  ) {}

  async logMessage(input: LogMessageInput): Promise<BaileysMessageLogDocument> {
    return this.logModel.create({ ...input, sentAt: new Date() });
  }

  async getLogs(
    filters: {
      status?: string;
      channel?: string;
      orderId?: string;
      from?: Date;
      to?: Date;
    },
    page = 1,
    limit = 50,
  ): Promise<{ logs: BaileysMessageLogDocument[]; total: number }> {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.channel) query.channel = filters.channel;
    if (filters.orderId) query.orderId = filters.orderId;
    if (filters.from || filters.to) {
      query.sentAt = {};
      if (filters.from) query.sentAt.$gte = filters.from;
      if (filters.to) query.sentAt.$lte = filters.to;
    }

    const [logs, total] = await Promise.all([
      this.logModel
        .find(query)
        .sort({ sentAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.logModel.countDocuments(query),
    ]);

    return { logs: logs as any, total };
  }

  async getStats(from: Date, to: Date) {
    const match = { sentAt: { $gte: from, $lte: to } };

    const [totals, byChannel, byStatus] = await Promise.all([
      this.logModel.countDocuments(match),
      this.logModel.aggregate([
        { $match: match },
        { $group: { _id: '$channel', count: { $sum: 1 } } },
      ]),
      this.logModel.aggregate([
        { $match: match },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    const channelMap: Record<string, number> = {};
    byChannel.forEach((c) => (channelMap[c._id] = c.count));

    const statusMap: Record<string, number> = {};
    byStatus.forEach((s) => (statusMap[s._id] = s.count));

    return {
      total: totals,
      nurenSuccess: channelMap['NUREN'] || 0,
      baileysSuccess: channelMap['BAILEYS'] || 0,
      noneDelivered: channelMap['NONE'] || 0,
      success: statusMap['SUCCESS'] || 0,
      failed: statusMap['FAILED'] || 0,
      skippedLimit: statusMap['SKIPPED_LIMIT'] || 0,
      noFallback: statusMap['NO_FALLBACK'] || 0,
    };
  }

  async getTodayStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return this.getStats(today, tomorrow);
  }
}
