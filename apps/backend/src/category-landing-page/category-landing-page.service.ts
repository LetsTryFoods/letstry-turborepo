import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CategoryLandingPage,
  CategoryLandingPageDocument,
  CATEGORY_LANDING_PAGE_MODEL,
} from './category-landing-page.schema';
import {
  CategoryLandingPageType,
  CreateCategoryLandingPageInput,
  UpdateCategoryLandingPageInput,
} from './category-landing-page.dto';

@Injectable()
export class CategoryLandingPageService {
  constructor(
    @InjectModel(CATEGORY_LANDING_PAGE_MODEL)
    private readonly model: Model<CategoryLandingPageDocument>,
  ) {}

  async create(
    input: CreateCategoryLandingPageInput,
  ): Promise<CategoryLandingPageType> {
    const doc = new this.model(input);
    const saved = await doc.save();
    return this.normalize(saved.toObject());
  }

  async findAll(): Promise<CategoryLandingPageType[]> {
    const docs = await this.model.find().sort({ createdAt: -1 }).lean().exec();
    return docs.map((d) => this.normalize(d));
  }

  async findOne(id: string): Promise<CategoryLandingPageType> {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc)
      throw new NotFoundException(`CategoryLandingPage ${id} not found`);
    return this.normalize(doc);
  }

  async findBySlug(slug: string): Promise<CategoryLandingPageType | null> {
    const doc = await this.model
      .findOne({ slug, isActive: true })
      .lean()
      .exec();
    if (!doc) return null;
    return this.normalize(doc);
  }

  async update(
    id: string,
    input: UpdateCategoryLandingPageInput,
  ): Promise<CategoryLandingPageType> {
    const doc = await this.model
      .findByIdAndUpdate(id, input, { new: true })
      .lean()
      .exec();
    if (!doc)
      throw new NotFoundException(`CategoryLandingPage ${id} not found`);
    return this.normalize(doc);
  }

  async remove(id: string): Promise<CategoryLandingPageType> {
    const doc = await this.model.findByIdAndDelete(id).lean().exec();
    if (!doc)
      throw new NotFoundException(`CategoryLandingPage ${id} not found`);
    return this.normalize(doc);
  }

  private normalize(doc: any): CategoryLandingPageType {
    return {
      ...doc,
      tiles: (doc.tiles ?? []).map((t: any) => ({
        ...t,
        position: t.position ?? 0,
      })),
      faqs: (doc.faqs ?? []).map((f: any) => ({
        ...f,
        position: f.position ?? 0,
      })),
    } as CategoryLandingPageType;
  }
}
