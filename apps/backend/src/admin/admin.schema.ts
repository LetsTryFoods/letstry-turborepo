import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ObjectType, Field, ID } from '@nestjs/graphql';

export type AdminDocument = Admin & Document;

@ObjectType()
@Schema()
export class Admin {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: false })
  refreshToken?: string;

  @Field()
  @Prop({ default: Date.now })
  createdAt: Date;

  @Field()
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
