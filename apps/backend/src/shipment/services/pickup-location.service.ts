import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PickupLocation } from '../entities/pickup-location.entity';
import { CreatePickupLocationInput } from '../dto/create-pickup-location.input';

@Injectable()
export class PickupLocationService {
  constructor(
    @InjectModel(PickupLocation.name)
    private pickupLocationModel: Model<PickupLocation>,
  ) {}

  async findAll(): Promise<PickupLocation[]> {
    return this.pickupLocationModel.find().exec();
  }

  async create(
    createPickupLocationInput: CreatePickupLocationInput,
  ): Promise<PickupLocation> {
    const createdPickupLocation = new this.pickupLocationModel(
      createPickupLocationInput,
    );
    return createdPickupLocation.save();
  }

  async findOne(id: string): Promise<PickupLocation | null> {
    return this.pickupLocationModel.findById(id).exec();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.pickupLocationModel.findByIdAndDelete(id).exec();
    return result !== null;
  }
}
