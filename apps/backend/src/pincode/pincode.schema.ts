import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  ObjectType,
  Field,
  ID,
  GraphQLISODateTime,
  Int,
} from '@nestjs/graphql';

export type PincodeDocument = Pincode & Document;

@Schema({ timestamps: true })
@ObjectType()
export class Pincode {
  @Field(() => ID)
  _id: string;

  @Prop({ required: true, index: true })
  @Field()
  pincode: string;

  @Prop({ required: true })
  @Field()
  product: string;

  @Prop({ required: true })
  @Field()
  city: string;

  @Prop({ required: true })
  @Field()
  state: string;

  @Prop({ required: true })
  @Field()
  zone: string;

  @Prop({ required: true })
  @Field(() => Int)
  tat: number;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}

export const PincodeSchema = SchemaFactory.createForClass(Pincode);
PincodeSchema.index({ pincode: 1, product: 1 }, { unique: true });
