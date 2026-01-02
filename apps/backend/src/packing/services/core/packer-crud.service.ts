import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Packer } from '../../entities/packer.entity';

@Injectable()
export class PackerCrudService {
  constructor(@InjectModel(Packer.name) private packerModel: Model<Packer>) {}

  async create(data: Partial<Packer>): Promise<Packer> {
    const packer = new this.packerModel(data);
    return packer.save();
  }

  async findById(id: string): Promise<Packer | null> {
    return this.packerModel.findById(id).exec();
  }

  async findByEmployeeId(employeeId: string): Promise<Packer | null> {
    return this.packerModel.findOne({ employeeId }).exec();
  }

  async findAll(filter: any = {}): Promise<Packer[]> {
    return this.packerModel.find(filter).exec();
  }

  async update(id: string, data: Partial<Packer>): Promise<Packer | null> {
    return this.packerModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<Packer | null> {
    return this.packerModel.findByIdAndDelete(id).exec();
  }
}
