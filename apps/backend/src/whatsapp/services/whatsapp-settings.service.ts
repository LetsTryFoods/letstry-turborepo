import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WhatsAppSettings,
  WhatsAppSettingsDocument,
} from '../schemas/whatsapp-settings.schema';

@Injectable()
export class WhatsAppSettingsService {
  constructor(
    @InjectModel(WhatsAppSettings.name)
    private settingsModel: Model<WhatsAppSettingsDocument>,
  ) {}

  private async getOrCreate(): Promise<WhatsAppSettingsDocument> {
    let settings = await this.settingsModel.findOne({ key: 'global' });
    if (!settings) {
      settings = await this.settingsModel.create({
        key: 'global',
        baileysDailyLimit: 10,
        baileysEnabled: true,
        nurenEnabled: true,
      });
    }
    return settings;
  }

  async getSettings(): Promise<WhatsAppSettingsDocument> {
    return this.getOrCreate();
  }

  async getDailyLimit(): Promise<number> {
    const settings = await this.getOrCreate();
    return settings.baileysDailyLimit;
  }

  async updateSettings(updates: {
    baileysDailyLimit?: number;
    baileysEnabled?: boolean;
    nurenEnabled?: boolean;
  }): Promise<WhatsAppSettingsDocument> {
    return this.settingsModel.findOneAndUpdate(
      { key: 'global' },
      { $set: updates },
      { upsert: true, new: true },
    );
  }
}
