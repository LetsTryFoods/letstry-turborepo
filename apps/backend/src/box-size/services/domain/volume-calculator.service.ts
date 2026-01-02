import { Injectable } from '@nestjs/common';

@Injectable()
export class VolumeCalculatorService {
  calculateTotalVolume(items: any[]): number {
    return items.reduce((total, item) => {
      const itemVolume =
        item.dimensions.length *
        item.dimensions.width *
        item.dimensions.height *
        item.quantity;
      return total + itemVolume;
    }, 0);
  }

  applyBuffer(volume: number): number {
    return volume * 1.15;
  }
}
