import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Redirect } from './redirect.schema';
import { CreateRedirectInput, UpdateRedirectInput } from './redirect.dto';

@Injectable()
export class RedirectService {
  constructor(
    @InjectModel(Redirect.name)
    private redirectModel: Model<Redirect>,
  ) {}

  async create(createRedirectInput: CreateRedirectInput): Promise<Redirect> {
    const existing = await this.redirectModel.findOne({
      fromPath: createRedirectInput.fromPath,
    });

    if (existing) {
      throw new ConflictException('Redirect with this fromPath already exists');
    }

    const redirect = new this.redirectModel(createRedirectInput);
    return redirect.save();
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const query = search
      ? {
          $or: [
            { fromPath: { $regex: search, $options: 'i' } },
            { toPath: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      this.redirectModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.redirectModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Redirect> {
    const redirect = await this.redirectModel.findById(id);
    if (!redirect) {
      throw new NotFoundException('Redirect not found');
    }
    return redirect;
  }

  async findByFromPath(fromPath: string): Promise<Redirect | null> {
    return this.redirectModel.findOne({ fromPath, isActive: true });
  }

  async update(id: string, updateRedirectInput: UpdateRedirectInput): Promise<Redirect> {
    if (updateRedirectInput.fromPath) {
      const existing = await this.redirectModel.findOne({
        fromPath: updateRedirectInput.fromPath,
        _id: { $ne: id },
      });

      if (existing) {
        throw new ConflictException('Redirect with this fromPath already exists');
      }
    }

    const redirect = await this.redirectModel.findByIdAndUpdate(
      id,
      updateRedirectInput,
      { new: true },
    );

    if (!redirect) {
      throw new NotFoundException('Redirect not found');
    }

    return redirect;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.redirectModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Redirect not found');
    }
    return true;
  }

  async bulkCreate(redirects: CreateRedirectInput[]): Promise<Redirect[]> {
    return this.redirectModel.insertMany(redirects, { ordered: false });
  }

  async getAllActiveRedirects(): Promise<Redirect[]> {
    return this.redirectModel.find({ isActive: true }).select('fromPath toPath statusCode').lean();
  }
}
