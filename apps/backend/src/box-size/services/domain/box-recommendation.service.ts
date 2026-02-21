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

    for (const box of boxes.sort(
      (a, b) =>
        a.internalDimensions.l *
          a.internalDimensions.w *
          a.internalDimensions.h -
        b.internalDimensions.l *
          b.internalDimensions.w *
          b.internalDimensions.h,
    )) {
      const boxVolume =
        box.internalDimensions.l *
        box.internalDimensions.w *
        box.internalDimensions.h;

      if (boxVolume >= totalVolume && box.maxWeight >= totalWeight) {
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
    return box.maxWeight >= totalWeight;
  }
}
