import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PillarDocument, PILLAR_MODEL } from './pillar.schema';
import { Pillar } from './pillar.graphql';
import { CreatePillarInput, UpdatePillarInput } from './pillar.input';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class PillarService {
  constructor(
    @InjectModel(PILLAR_MODEL) private pillarModel: Model<PillarDocument>,
    private readonly logger: WinstonLoggerService,
  ) {}

  async create(input: CreatePillarInput): Promise<Pillar> {
    const created = new this.pillarModel(input);
    const saved = await created.save();
    this.logger.log(`Pillar created: ${saved.slug}`);
    return saved.toObject() as any as Pillar;
  }

  async findAll(): Promise<Pillar[]> {
    return (await this.pillarModel
      .find()
      .sort({ position: 1 })
      .lean()
      .exec()) as any as Pillar[];
  }

  async findActive(): Promise<Pillar[]> {
    return (await this.pillarModel
      .find({ isActive: true })
      .sort({ position: 1 })
      .lean()
      .exec()) as any as Pillar[];
  }

  async findBySlug(slug: string): Promise<Pillar> {
    const pillar = await this.pillarModel.findOne({ slug }).lean().exec();
    if (!pillar) throw new NotFoundException(`Pillar ${slug} not found`);
    return pillar as any as Pillar;
  }

  /**
   * Look up an active pillar by its customRoute (e.g. '/no-palm-oil-snacks').
   * Returns null when no match — callers (the storefront [slug] route)
   * should fall through to category lookup on null.
   */
  async findByCustomRoute(route: string): Promise<Pillar | null> {
    const pillar = await this.pillarModel
      .findOne({ customRoute: route, isActive: true })
      .lean()
      .exec();
    return pillar ? (pillar as any as Pillar) : null;
  }

  async findOne(id: string): Promise<Pillar> {
    const pillar = await this.pillarModel.findById(id).lean().exec();
    if (!pillar) throw new NotFoundException(`Pillar ${id} not found`);
    return pillar as any as Pillar;
  }

  async update(id: string, input: UpdatePillarInput): Promise<Pillar> {
    const pillar = await this.pillarModel
      .findByIdAndUpdate(id, input, { new: true })
      .lean()
      .exec();
    if (!pillar) throw new NotFoundException(`Pillar ${id} not found`);
    this.logger.log(`Pillar updated: ${id}`);
    return pillar as any as Pillar;
  }

  async remove(id: string): Promise<Pillar> {
    const pillar = await this.pillarModel.findByIdAndDelete(id).lean().exec();
    if (!pillar) throw new NotFoundException(`Pillar ${id} not found`);
    return pillar as any as Pillar;
  }
}
