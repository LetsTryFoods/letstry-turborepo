import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderStatus } from '../order.schema';
import { BoxSizeCrudService } from '../../box-size/services/core/box-size-crud.service';

@Injectable()
export class LogisticsAnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly boxSizeCrudService: BoxSizeCrudService,
  ) {}

  /**
   * Calculate monthly logistics analytics.
   * Month is provided as 1-12, year as YYYY.
   */
  async getMonthlyAnalytics(month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      boxId: { $exists: true, $ne: null },
      orderStatus: { $nin: [OrderStatus.SHIPMENT_FAILED] } // Exclude failed? Usually we count all packed/shipped.
    };

    // Aggregate orders
    const stats = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalBaseCost: { $sum: '$logisticsCost' },
          totalVolumetricWeight: { $sum: '$volumetricWeight' },
          totalBoxesUsed: { $sum: 1 },
        }
      }
    ]).exec();

    const baseCost = stats.length > 0 ? stats[0].totalBaseCost : 0;
    const volumetricWeight = stats.length > 0 ? stats[0].totalVolumetricWeight : 0;
    const boxesUsed = stats.length > 0 ? stats[0].totalBoxesUsed : 0;

    // Apply Additional Charges
    const fuelCharge = baseCost * 0.25;
    const fovCharge = baseCost * 0.002;
    const preGst = baseCost + fuelCharge + fovCharge;
    const gstCharge = preGst * 0.18;
    const totalCost = preGst + gstCharge;

    // Region-wise shipment count and cost
    const regionStats = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          baseCost: { $sum: '$logisticsCost' },
          volumetricWeight: { $sum: '$volumetricWeight' }
        }
      },
      {
        $project: {
          region: '$_id',
          count: 1,
          baseCost: 1,
          volumetricWeight: 1,
          _id: 0
        }
      }
    ]).exec();

    // Calculate regional total cost including surcharges
    const regionStatsWithSurcharges = regionStats.map(r => {
      const fuel = r.baseCost * 0.25;
      const fov = r.baseCost * 0.002;
      const pgst = r.baseCost + fuel + fov;
      const gst = pgst * 0.18;
      return {
        ...r,
        totalCost: pgst + gst
      };
    });

    // Box usage stats
    const boxUsage = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$boxId',
          count: { $sum: 1 },
          baseCost: { $sum: '$logisticsCost' }
        }
      },
      { $sort: { count: -1 } }
    ]).exec();

    // Populate box names
    const populatedBoxUsage = await Promise.all(
      boxUsage.map(async (b) => {
        const box = await this.boxSizeCrudService.findById(b._id);
        return {
          boxId: b._id.toString(),
          boxName: box ? box.name : 'Unknown Box',
          count: b.count,
          costGenerated: b.baseCost
        };
      })
    );

    const mostUsedBox = populatedBoxUsage.length > 0 ? populatedBoxUsage[0] : null;
    const leastUsedBox = populatedBoxUsage.length > 0 ? populatedBoxUsage[populatedBoxUsage.length - 1] : null;

    return {
      month,
      year,
      totalCost,
      totalBaseCost: baseCost,
      fuelCharge,
      fovCharge,
      gstCharge,
      totalVolumetricWeight: volumetricWeight,
      totalBoxesUsed: boxesUsed,
      regionStats: regionStatsWithSurcharges,
      boxUsage: populatedBoxUsage,
      mostUsedBox,
      leastUsedBox
    };
  }
}
