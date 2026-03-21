import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from '../contact.schema';
import { SubmitContactInput } from '../dto/submit-contact.input';

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);

  constructor(
    @InjectModel(Contact.name) private contactModel: Model<ContactDocument>,
  ) {}

  async create(input: SubmitContactInput): Promise<Contact> {
    const contact = new this.contactModel(input);
    return contact.save();
  }

  async findAll(skip: number = 0, limit: number = 50): Promise<Contact[]> {
    return this.contactModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
  }

  async countAll(): Promise<number> {
    return this.contactModel.countDocuments().exec();
  }
}
