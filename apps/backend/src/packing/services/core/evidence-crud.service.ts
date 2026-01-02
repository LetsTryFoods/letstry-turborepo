import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PackingEvidence } from '../../entities/packing-evidence.entity';

@Injectable()
export class EvidenceCrudService {
  constructor(
    @InjectModel(PackingEvidence.name)
    private evidenceModel: Model<PackingEvidence>,
  ) {}

  async create(data: Partial<PackingEvidence>): Promise<PackingEvidence> {
    const evidence = new this.evidenceModel(data);
    return evidence.save();
  }

  async findById(id: string): Promise<PackingEvidence | null> {
    return this.evidenceModel.findById(id).exec();
  }

  async findByOrder(orderId: string): Promise<PackingEvidence | null> {
    return this.evidenceModel.findOne({ packingOrderId: orderId }).exec();
  }

  async update(
    id: string,
    data: Partial<PackingEvidence>,
  ): Promise<PackingEvidence | null> {
    return this.evidenceModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}
