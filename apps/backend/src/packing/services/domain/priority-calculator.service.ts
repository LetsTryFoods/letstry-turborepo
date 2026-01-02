import { Injectable } from '@nestjs/common';

@Injectable()
export class PriorityCalculatorService {
  async calculatePriority(orderId: string): Promise<number> {
    // Implementation for calculating order priority
    // Based on order value, wait time, express flag
    return 1;
  }

  async applyBusinessRules(orderData: any): Promise<number> {
    let priority = 1;

    if (orderData.isExpress) priority += 10;
    if (orderData.orderValue > 100) priority += 5;
    if (orderData.waitingTime > 30) priority += 3;

    return priority;
  }
}
