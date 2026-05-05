import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ObjectType, Field, Int, ID, registerEnumType } from '@nestjs/graphql';

export type InventoryLogDocument = InventoryLog & Document;

export enum InventoryAction {
  INWARD = 'INWARD',
  ORDER_PACKED = 'ORDER_PACKED',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT',
  RETURN = 'RETURN',
}

registerEnumType(InventoryAction, {
  name: 'InventoryAction',
});

@Schema({ timestamps: true, collection: 'inventorylogs' })
@ObjectType()
export class InventoryLog {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true, index: true })
  @Field()
  sku: string;

  @Prop({ required: true, type: MongooseSchema.Types.ObjectId, ref: 'Product' })
  @Field(() => ID)
  productId: string;

  @Prop({ required: true })
  @Field(() => Int)
  changeAmount: number;

  @Prop({ required: true })
  @Field(() => Int)
  previousStock: number;

  @Prop({ required: true })
  @Field(() => Int)
  newStock: number;

  @Prop({ required: true, type: String, enum: InventoryAction })
  @Field(() => InventoryAction)
  actionType: InventoryAction;

  @Prop()
  @Field({ nullable: true })
  referenceId?: string;

  @Prop()
  @Field({ nullable: true })
  performedBy?: string;

  @Prop()
  @Field({ nullable: true })
  notes?: string;

  @Field(() => Date)
  createdAt: Date;
}

export const InventoryLogSchema = SchemaFactory.createForClass(InventoryLog);

InventoryLogSchema.index({ sku: 1, createdAt: -1 });
InventoryLogSchema.index({ actionType: 1 });
