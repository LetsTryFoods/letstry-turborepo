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
        minAppVersionAndroid: '1.0.0',
        minAppVersionIos: '1.0.0',
      });
    }
    return settings;
  }

  async updateGlobalSettings(
    isPackerScanBypassEnabled: boolean,
    minAppVersionAndroid: string,
    minAppVersionIos: string,
  ): Promise<GlobalSettingsDocument> {
    const settings = await this.getGlobalSettings();
    settings.isPackerScanBypassEnabled = isPackerScanBypassEnabled;
    settings.minAppVersionAndroid = minAppVersionAndroid;
    settings.minAppVersionIos = minAppVersionIos;
    return settings.save();
  }
}
