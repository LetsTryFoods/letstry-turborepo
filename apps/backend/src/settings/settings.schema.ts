import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export type GlobalSettingsDocument = GlobalSettings & Document;

@ObjectType()
@Schema({ collection: 'global_settings', timestamps: true })
export class GlobalSettings {
  @Field(() => ID)
  _id: string;

  @Field(() => Boolean)
  @Prop({ default: false })
  isPackerScanBypassEnabled: boolean;

  @Field(() => String)
  @Prop({ default: '1.0.0' })
  minAppVersionAndroid: string;

  @Field(() => String)
  @Prop({ default: '1.0.0' })
  minAppVersionIos: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

export const GlobalSettingsSchema = SchemaFactory.createForClass(GlobalSettings);
