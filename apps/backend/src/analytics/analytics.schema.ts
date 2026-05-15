import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class OSSplit {
  @Field(() => Float)
  android: number;

  @Field(() => Float)
  ios: number;

  @Field(() => Float)
  windows: number;

  @Field(() => Float)
  macOS: number;

  @Field(() => Float)
  other: number;
}

@ObjectType()
export class QRScanItem {
  @Field()
  fingerprint: string;

  @Field()
  device: string;

  @Field()
  os: string;

  @Field()
  userAgent: string;

  @Field()
  ipAddress: string;

  @Field()
  location: string;

  @Field(() => Float)
  timesScanned: number;

  @Field(() => [String])
  dateTime: string[];
}

@ObjectType()
export class QRAnalyticsSummary {
  @Field(() => Float)
  totalScans: number;

  @Field(() => Float)
  uniqueScans: number;

  @Field(() => OSSplit)
  totalOSSplit: OSSplit;

  @Field(() => OSSplit)
  uniqueOSSplit: OSSplit;

  @Field(() => [QRScanItem])
  recentScans: QRScanItem[];
}

// Mongoose Schemas mapped precisely to underlying collection names
@Schema({ collection: 'qr_scan_data' })
export class QRScanDataDoc {
  @Prop()
  fingerprint: string;

  @Prop()
  device: string;

  @Prop()
  os: string;

  @Prop()
  user_agent: string;

  @Prop()
  ip_address: string;

  @Prop()
  location: string;

  @Prop()
  times_scanned: number;

  @Prop([String])
  date_time: string[];
}

export type QRScanDataDocument = QRScanDataDoc & Document;
export const QRScanDataSchema = SchemaFactory.createForClass(QRScanDataDoc);

@Schema({ collection: 'qr_total_scan_count' })
export class QRTotalScanDoc {
  @Prop()
  qr_id: string;

  @Prop()
  total_scans: number;

  @Prop({ type: Object })
  os_split: Record<string, number>;
}

export type QRTotalScanDocument = QRTotalScanDoc & Document;
export const QRTotalScanSchema = SchemaFactory.createForClass(QRTotalScanDoc);

@Schema({ collection: 'qr_unique_scan_count' })
export class QRUniqueScanDoc {
  @Prop()
  qr_id: string;

  @Prop()
  unique_scans: number;

  @Prop({ type: Object })
  os_split: Record<string, number>;
}

export type QRUniqueScanDocument = QRUniqueScanDoc & Document;
export const QRUniqueScanSchema = SchemaFactory.createForClass(QRUniqueScanDoc);
