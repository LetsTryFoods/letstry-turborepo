import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsService } from './analytics.service';
import { AnalyticsResolver } from './analytics.resolver';
import {
  QRScanDataDoc,
  QRScanDataSchema,
  QRTotalScanDoc,
  QRTotalScanSchema,
  QRUniqueScanDoc,
  QRUniqueScanSchema,
} from './analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QRScanDataDoc.name, schema: QRScanDataSchema },
      { name: QRTotalScanDoc.name, schema: QRTotalScanSchema },
      { name: QRUniqueScanDoc.name, schema: QRUniqueScanSchema },
    ]),
  ],
  providers: [AnalyticsService, AnalyticsResolver],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
