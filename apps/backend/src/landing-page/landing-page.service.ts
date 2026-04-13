import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LandingPageDocument, LANDING_PAGE_MODEL } from './landing-page.schema';
import { LandingPage } from './landing-page.graphql';
import { CreateLandingPageInput, UpdateLandingPageInput } from './landing-page.input';
import { CacheService } from '../cache/cache.service';
import { CacheKeyFactory } from '../cache/cache-key.factory';
import { CacheInvalidatorService } from '../cache/cache-invalidator.service';

@Injectable()
export class LandingPageService {
  private readonly TTL = 15552000000;
  private readonly CACHE_TYPE_ALL = 'all';
  private readonly CACHE_TYPE_ACTIVE = 'active';

  constructor(
    @InjectModel(LANDING_PAGE_MODEL) private landingPageModel: Model<LandingPageDocument>,
    private readonly cacheService: CacheService,
    private readonly cacheKeyFactory: CacheKeyFactory,
    private readonly cacheInvalidatorService: CacheInvalidatorService,
  ) {}

  async create(input: CreateLandingPageInput): Promise<LandingPage> {
    const created = new this.landingPageModel(input);
    const saved = await created.save();
    await this.cacheInvalidatorService.invalidateLandingPage();
    return this.normalizePage(saved.toObject());
  }

  async findAll(): Promise<LandingPage[]> {
    return this.getCachedList(this.CACHE_TYPE_ALL, () =>
      this.landingPageModel.find().sort({ position: 1 }).lean().exec(),
    );
  }

  async findActive(): Promise<LandingPage[]> {
    return this.getCachedList(this.CACHE_TYPE_ACTIVE, () =>
      this.landingPageModel.find({ isActive: true }).sort({ position: 1 }).lean().exec(),
    );
  }

  async findOne(id: string): Promise<LandingPage> {
    return this.findByIdOrThrow(id);
  }

  async findBySlug(slug: string): Promise<LandingPage> {
    const page = await this.landingPageModel.findOne({ slug }).lean().exec();
    if (!page) {
      throw new NotFoundException(`Landing page with slug "${slug}" not found`);
    }
    return this.normalizePage(page);
  }

  async update(id: string, input: UpdateLandingPageInput): Promise<LandingPage> {
    const page = await this.landingPageModel
      .findByIdAndUpdate(id, input, { new: true })
      .lean()
      .exec();
    if (!page) {
      throw new NotFoundException(`Landing page with ID ${id} not found`);
    }
    await this.cacheInvalidatorService.invalidateLandingPage();
    return this.normalizePage(page);
  }

  async remove(id: string): Promise<LandingPage> {
    const page = await this.landingPageModel.findByIdAndDelete(id).lean().exec();
    if (!page) {
      throw new NotFoundException(`Landing page with ID ${id} not found`);
    }
    await this.cacheInvalidatorService.invalidateLandingPage();
    return this.normalizePage(page);
  }

  private normalizePage(page: any): LandingPage {
    return {
      ...page,
      sections: (page.sections ?? []).map((s: any) => ({
        ...s,
        productSlugs: s.productSlugs ?? [],
        platformLinks: s.platformLinks ?? [],
      })),
    } as any as LandingPage;
  }

  private async getCachedList(type: string, fetcher: () => Promise<any[]>): Promise<LandingPage[]> {
    const versionKey = this.cacheKeyFactory.getLandingPageListVersionKey();
    const version = await this.cacheService.getVersion(versionKey);
    const key = this.cacheKeyFactory.getLandingPageListKey(version, type);
    const cached = await this.cacheService.get<LandingPage[]>(key);
    if (cached) return cached;
    const raw = await fetcher();
    const data = raw.map((p) => this.normalizePage(p)) as LandingPage[];
    await this.cacheService.set(key, data, this.TTL);
    return data;
  }

  private async findByIdOrThrow(id: string): Promise<LandingPage> {
    const page = await this.landingPageModel.findById(id).lean().exec();
    if (!page) {
      throw new NotFoundException(`Landing page with ID ${id} not found`);
    }
    return this.normalizePage(page);
  }
}
