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
  name!: string;

  @Prop({ required: true })
  @Field()
  phone!: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  email?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  orderId?: string;

  @Prop({ required: false })
  @Field({ nullable: true })
  queryType?: string;

  @Prop({ type: [String], default: undefined })
  @Field(() => [String], { nullable: true })
  productNames?: string[];

  @Prop({ type: [String], default: undefined })
  @Field(() => [String], { nullable: true })
  imageUrls?: string[];

  @Prop({ required: true })
  @Field()
  message!: string;

  @Prop({
    required: true,
    enum: Object.values(ContactStatus),
    default: ContactStatus.PENDING,
  })
  @Field(() => ContactStatus)
  status!: ContactStatus;

  // ── WhatsApp Support Fields ───────────────────────────────────────────────

  @Prop({ required: false })
  @Field({ nullable: true })
  whatsappPhoneNumber?: string; // normalized e.g. "918840330283"

  @Prop({ required: false })
  @Field({ nullable: true })
  whatsappWindowExpiresAt?: Date; // last inbound + 24h

  @Prop({ required: false })
  @Field({ nullable: true })
  whatsappTemplateSentAt?: Date; // when ack template was first fired

  /** Timestamp of the most recent INCOMING WhatsApp message from the customer */
  @Prop({ required: false })
  @Field(() => Date, { nullable: true })
  lastInboundAt?: Date;

  /** When admin last opened this chat — used to compute hasUnread */
  @Prop({ required: false })
  @Field(() => Date, { nullable: true })
  adminLastReadAt?: Date;

  /** Computed at query time (not stored in DB): true if lastInboundAt > adminLastReadAt */
  @Field(() => Boolean, { nullable: true })
  hasUnread?: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

export const ContactSchema = SchemaFactory.createForClass(Contact);

ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1 });
ContactSchema.index({ whatsappPhoneNumber: 1 });
ContactSchema.index({ lastInboundAt: -1 });

