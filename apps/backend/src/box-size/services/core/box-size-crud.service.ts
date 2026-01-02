import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BoxSize } from '../../entities/box-size.entity';

@Injectable()
export class BoxSizeCrudService {
  constructor(
    @InjectModel(BoxSize.name) private boxSizeModel: Model<BoxSize>,
  ) {}

  async create(data: Partial<BoxSize>): Promise<BoxSize> {
    const box = new this.boxSizeModel(data);
    return box.save();
  }

  async findById(id: string): Promise<BoxSize | null> {
    return this.boxSizeModel.findById(id).exec();
  }

  async findByCode(code: string): Promise<BoxSize | null> {
    return this.boxSizeModel.findOne({ code }).exec();
  }

  async findAll(): Promise<BoxSize[]> {
    return this.boxSizeModel.find().exec();
  }

  async findActive(): Promise<BoxSize[]> {
    return this.boxSizeModel.find({ isActive: true }).exec();
  }

  async update(id: string, data: Partial<BoxSize>): Promise<BoxSize | null> {
    return this.boxSizeModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<BoxSize | null> {
    return this.boxSizeModel.findByIdAndDelete(id).exec();
  }
}
