import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PressMentionDocument,
  PRESS_MENTION_MODEL,
} from './press-mention.schema';
import { PressMention } from './press-mention.graphql';
import {
  CreatePressMentionInput,
  UpdatePressMentionInput,
} from './press-mention.input';

@Injectable()
export class PressMentionService {
  constructor(
    @InjectModel(PRESS_MENTION_MODEL)
    private pressMentionModel: Model<PressMentionDocument>,
  ) {}

  async create(input: CreatePressMentionInput): Promise<PressMention> {
    const created = new this.pressMentionModel(input);
    const saved = await created.save();
    return saved.toObject() as any as PressMention;
  }

  async findAll(): Promise<PressMention[]> {
    return (await this.pressMentionModel
      .find()
      .sort({ position: 1, publishedAt: -1 })
      .lean()
      .exec()) as any as PressMention[];
  }

  async findActive(): Promise<PressMention[]> {
    return (await this.pressMentionModel
      .find({ isActive: true })
      .sort({ position: 1, publishedAt: -1 })
      .lean()
      .exec()) as any as PressMention[];
  }

  async findBySlug(slug: string): Promise<PressMention> {
    const mention = await this.pressMentionModel
      .findOne({ slug })
      .lean()
      .exec();
    if (!mention) throw new NotFoundException(`PressMention ${slug} not found`);
    return mention as any as PressMention;
  }

  async findOne(id: string): Promise<PressMention> {
    const mention = await this.pressMentionModel.findById(id).lean().exec();
    if (!mention) throw new NotFoundException(`PressMention ${id} not found`);
    return mention as any as PressMention;
  }

  async update(
    id: string,
    input: UpdatePressMentionInput,
  ): Promise<PressMention> {
    const mention = await this.pressMentionModel
      .findByIdAndUpdate(id, input, { new: true })
      .lean()
      .exec();
    if (!mention) throw new NotFoundException(`PressMention ${id} not found`);
    return mention as any as PressMention;
  }

  async remove(id: string): Promise<PressMention> {
    const mention = await this.pressMentionModel
      .findByIdAndDelete(id)
      .lean()
      .exec();
    if (!mention) throw new NotFoundException(`PressMention ${id} not found`);
    return mention as any as PressMention;
  }
}
