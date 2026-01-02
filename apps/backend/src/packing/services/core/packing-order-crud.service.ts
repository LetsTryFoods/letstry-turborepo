import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PackingOrder } from '../../entities/packing-order.entity';

@Injectable()
export class PackingOrderCrudService {
  constructor(
    @InjectModel(PackingOrder.name)
    private packingOrderModel: Model<PackingOrder>,
  ) {}

  async create(data: Partial<PackingOrder>): Promise<PackingOrder> {
    const order = new this.packingOrderModel(data);
    return order.save();
  }

  async findById(id: string): Promise<PackingOrder | null> {
    return this.packingOrderModel.findById(id).exec();
  }

  async findAll(filter: any = {}): Promise<PackingOrder[]> {
    return this.packingOrderModel.find(filter).exec();
  }

  async findByPacker(packerId: string): Promise<PackingOrder[]> {
    return this.packingOrderModel.find({ assignedTo: packerId }).exec();
  }

  async findByStatus(status: string): Promise<PackingOrder[]> {
    return this.packingOrderModel.find({ status }).exec();
  }

  async update(
    id: string,
    data: Partial<PackingOrder>,
  ): Promise<PackingOrder | null> {
    return this.packingOrderModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
  }

  async delete(id: string): Promise<PackingOrder | null> {
    return this.packingOrderModel.findByIdAndDelete(id).exec();
  }

  async setErrorFlag(id: string): Promise<void> {
    await this.packingOrderModel
      .updateOne({ _id: id }, { hasErrors: true })
      .exec();
  }
}
