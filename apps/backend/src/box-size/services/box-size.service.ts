import { Injectable } from '@nestjs/common';
import { BoxSizeCrudService } from './core/box-size-crud.service';
import { BoxRecommendationService } from './domain/box-recommendation.service';
import { VolumeCalculatorService } from './domain/volume-calculator.service';

@Injectable()
export class BoxSizeService {
  constructor(
    private readonly boxSizeCrud: BoxSizeCrudService,
    private readonly boxRecommendation: BoxRecommendationService,
    private readonly volumeCalculator: VolumeCalculatorService,
  ) {}

  async createBoxSize(input: any): Promise<any> {
    return this.boxSizeCrud.create(input);
  }

  async updateBoxSize(boxId: string, input: any): Promise<any> {
    return this.boxSizeCrud.update(boxId, input);
  }

  async deleteBoxSize(boxId: string): Promise<any> {
    return this.boxSizeCrud.delete(boxId);
  }

  async getAllBoxSizes(): Promise<any[]> {
    return this.boxSizeCrud.findAll();
  }

  async getActiveBoxSizes(): Promise<any[]> {
    return this.boxSizeCrud.findActive();
  }

  async recommendBox(items: any[]): Promise<any> {
    return this.boxRecommendation.selectOptimalBox(items);
  }
}
