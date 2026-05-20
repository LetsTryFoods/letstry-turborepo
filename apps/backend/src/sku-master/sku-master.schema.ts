import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

export type SkuMasterDocument = SkuMaster & Document;

@Schema({ timestamps: true })
@ObjectType()
export class SkuMaster {
  @Field(() => ID)
  _id: string;

  /**
   * Master SKU — unique numeric identifier from the Excel sheet (column: "Master SKU").
   */
  @Prop({ required: true, unique: true })
  @Field(() => Int)
  masterSku: number;

  /**
   * SKU Name — full product name as it appears on the label (column: "SKU Name").
   */
  @Prop({ required: true })
  @Field()
  skuName: string;

  /**
   * Vendor / manufacturer name (column: "Vendors Name").
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  vendorName?: string;

  /**
   * Vendor contact details — free-text (name + phone, column: "Vendors Contact Details").
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  vendorContactDetails?: string;

  /**
   * Job structure / case configuration (column: "Job Structure").
   * Examples: "12/8/12/40", "-"
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  jobStructure?: string;

  /**
   * Unit of Measure — net weight / volume printed on the pack (column: "UoM").
   * Examples: "173g", "200g".
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  uom?: string;

  /**
   * Case size — units per carton (column: "Case Size").
   */
  @Prop({ required: false, type: Number })
  @Field(() => Int, { nullable: true })
  caseSize?: number;

  /**
   * MRP in INR (column: "MRP").
   */
  @Prop({ required: false, type: Number })
  @Field(() => Float, { nullable: true })
  mrp?: number;

  /**
   * NPI (New Product Introduction) drive folder — RAW original link
   * (column: "NPI Links RAW").
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  npiLinksRaw?: string;

  /**
   * NPI drive folder — updated / final link to consider
   * (column: "New Updated Links (to be considered)").
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  npiLinksUpdated?: string;

  /**
   * Print-files drive folder — RAW original link
   * (column: "Print Files RAW").
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  printFilesRaw?: string;

  /**
   * Print-files drive folder — updated / final link to consider
   * (column: "New Drive Links (to be considered)").
   */
  @Prop({ required: false })
  @Field({ nullable: true })
  printFilesUpdated?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const SkuMasterSchema = SchemaFactory.createForClass(SkuMaster);

SkuMasterSchema.index({ masterSku: 1 }, { unique: true });
SkuMasterSchema.index({ skuName: 'text' });
