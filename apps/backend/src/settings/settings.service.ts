import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GlobalSettings, GlobalSettingsDocument } from './settings.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(GlobalSettings.name)
    private readonly settingsModel: Model<GlobalSettingsDocument>,
  ) {}

  async getGlobalSettings(): Promise<GlobalSettingsDocument> {
    let settings = await this.settingsModel.findOne().exec();
    if (!settings) {
      settings = await this.settingsModel.create({
        isPackerScanBypassEnabled: false,
      });
    }
    return settings;
  }

  async updateGlobalSettings(
    isPackerScanBypassEnabled: boolean,
  ): Promise<GlobalSettingsDocument> {
    const settings = await this.getGlobalSettings();
    settings.isPackerScanBypassEnabled = isPackerScanBypassEnabled;
    return settings.save();
  }
}
