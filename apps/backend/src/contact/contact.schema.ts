import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';

export type ContactDocument = Contact & Document;

export enum ContactStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
}

registerEnumType(ContactStatus, {
  name: 'ContactStatus',
  description: 'The status of the contact complaint',
});

@Schema({ timestamps: true })
@ObjectType()
export class Contact extends Document {
  @Field(() => ID)
  declare _id: Types.ObjectId;

  @Prop({ required: true })
  @Field()
  name: string;

  @Prop({ required: true })
  @Field()
  phone: string;

  @Prop({ required: true })
  @Field()
  message: string;

  @Prop({
    required: true,
    enum: Object.values(ContactStatus),
    default: ContactStatus.PENDING,
  })
  @Field(() => ContactStatus)
  status: ContactStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });
