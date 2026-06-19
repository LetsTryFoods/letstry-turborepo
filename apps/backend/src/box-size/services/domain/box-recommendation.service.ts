import { Injectable } from '@nestjs/common';
import { BoxSizeCrudService } from '../core/box-size-crud.service';
import { VolumeCalculatorService } from './volume-calculator.service';

@Injectable()
export class BoxRecommendationService {
  constructor(
    private readonly boxSizeCrud: BoxSizeCrudService,
    private readonly volumeCalculator: VolumeCalculatorService,
  ) {}

  async selectOptimalBox(items: any[]): Promise<any> {
    const totalVolume = this.volumeCalculator.calculateTotalVolume(items);
    const totalWeight = items.reduce(
      (sum, item) => sum + item.dimensions.weight * item.quantity,
      0,
    );
    const hasFragile = items.some((item) => item.isFragile);

    const boxes = await this.boxSizeCrud.findActive();

    for (const box of boxes.sort((a, b) => {
      const volA = a.internalDimensions
        ? a.internalDimensions.l * a.internalDimensions.w * a.internalDimensions.h
        : a.lengthCm * a.breadthCm * a.heightCm;
      const volB = b.internalDimensions
        ? b.internalDimensions.l * b.internalDimensions.w * b.internalDimensions.h
        : b.lengthCm * b.breadthCm * b.heightCm;
      return volA - volB;
    })) {
      const boxVolume = box.internalDimensions
        ? box.internalDimensions.l * box.internalDimensions.w * box.internalDimensions.h
        : box.lengthCm * box.breadthCm * box.heightCm;

      if (boxVolume >= totalVolume && (box.maxWeight || 99999) >= totalWeight) {
        if (hasFragile && boxVolume < totalVolume * 1.25) continue;
        return box;
      }
    }

    return boxes.length > 0 ? boxes[boxes.length - 1] : null;
  }

  async applyConstraints(items: any[], box: any): Promise<boolean> {
    const totalWeight = items.reduce(
      (sum, item) => sum + item.dimensions.weight * item.quantity,
      0,
    );
    return (box.maxWeight || 99999) >= totalWeight;
  }

  async getBoxByCode(code: string): Promise<any> {
    const boxes = await this.boxSizeCrud.findActive();
    return boxes.find((b) => b.code === code) || null;
  }
}
