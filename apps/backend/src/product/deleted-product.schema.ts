import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type DeletedProductDocument = DeletedProduct & Document;

@Schema({ collection: 'deleted_products', timestamps: true })
export class DeletedProduct {
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  productData: any;

  @Prop({ required: true, default: Date.now })
  deletedAt: Date;
}

export const DeletedProductSchema = SchemaFactory.createForClass(DeletedProduct);
