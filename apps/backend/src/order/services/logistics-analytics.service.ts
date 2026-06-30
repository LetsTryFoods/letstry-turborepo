import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderStatus } from '../order.schema';
import { BoxSizeCrudService } from '../../box-size/services/core/box-size-crud.service';

const DISCOUNT_RATE = 0.30; // 30% off MRP

@Injectable()
export class LogisticsAnalyticsService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly boxSizeCrudService: BoxSizeCrudService,
  ) {}

  /**
   * Calculate monthly logistics analytics (Original Method).
   */
  async getMonthlyAnalytics(month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      boxId: { $exists: true, $ne: null },
      orderStatus: { $nin: [OrderStatus.SHIPMENT_FAILED] },
    };

    const stats = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalBaseCost: { $sum: '$logisticsCost' },
          totalVolumetricWeight: { $sum: '$volumetricWeight' },
          totalBoxesUsed: { $sum: 1 },
        },
      },
    ]).exec();

    const baseCost = stats[0]?.totalBaseCost || 0;
    const volumetricWeight = stats[0]?.totalVolumetricWeight || 0;
    const boxesUsed = stats[0]?.totalBoxesUsed || 0;

    const fuelCharge = baseCost * 0.25;
    const fovCharge = baseCost * 0.002;
    const preGst = baseCost + fuelCharge + fovCharge;
    const gstCharge = preGst * 0.18;
    const totalCost = preGst + gstCharge;

    const regionStats = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          baseCost: { $sum: '$logisticsCost' },
          volumetricWeight: { $sum: '$volumetricWeight' },
        },
      },
      {
        $project: {
          region: '$_id',
          count: 1,
          baseCost: 1,
          volumetricWeight: 1,
          _id: 0,
        },
      },
    ]).exec();

    const regionStatsWithSurcharges = regionStats.map((r) => {
      const fuel = r.baseCost * 0.25;
      const fov = r.baseCost * 0.002;
      const pgst = r.baseCost + fuel + fov;
      const gst = pgst * 0.18;
      return { ...r, totalCost: pgst + gst };
    });

    const boxUsage = await this.orderModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$boxId',
          count: { $sum: 1 },
          baseCost: { $sum: '$logisticsCost' },
        },
      },
      { $sort: { count: -1 } },
    ]).exec();

    const populatedBoxUsage = await Promise.all(
      boxUsage.map(async (b) => {
        const box = await this.boxSizeCrudService.findById(b._id);
        return {
          boxId: b._id.toString(),
          boxName: box ? box.name : 'Unknown Box',
          count: b.count,
          costGenerated: b.baseCost,
        };
      }),
    );

    const mostUsedBox = populatedBoxUsage.length > 0 ? populatedBoxUsage[0] : null;
    const leastUsedBox = populatedBoxUsage.length > 0
      ? populatedBoxUsage[populatedBoxUsage.length - 1]
      : null;

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
      leastUsedBox,
    };
  }

  /**
   * New Method: Get Order-wise and Total Discount Analytics
   */
  async getDiscountAnalytics(month: number, year: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Only look at orders where logisticsCost is recorded so we can calculate net cost accurately
    const matchStage = {
      createdAt: { $gte: startDate, $lte: endDate },
      orderStatus: { $nin: [OrderStatus.SHIPMENT_FAILED] },
      logisticsCost: { $exists: true, $ne: null },
    };

    const ordersData = await this.orderModel.find(matchStage).lean().exec();

    const totalOrdersCount = ordersData.length;
    const serverCostPerOrder = totalOrdersCount > 0 ? 2500 / totalOrdersCount : 0;

    const orders: any[] = [];
    const summary = {
      totalOrders: 0,
      totalSubtotal: 0,
      totalDeliveryChargesCollected: 0,
      totalLogisticsCost: 0,
      totalFuelCharge: 0,
      totalFovCharge: 0,
      totalGstCharge: 0,
      totalNetRevenue: 0,
      impliedTotalMRP: 0,
      totalDiscountOnMRP: 0,
      totalNetCostToBusiness: 0,
      totalNetDiscountAmount: 0,
      avgNetDiscountPct: 0,
      freeDeliveryOrdersCount: 0,
      paidDeliveryOrdersCount: 0,
      totalZaakpayCost: 0,
      totalServerCost: 0,
    };

    const boxCache = new Map<string, any>();
    const getBoxInfo = async (id: string) => {
      if (!id) return null;
      if (boxCache.has(id)) return boxCache.get(id);
      const box = await this.boxSizeCrudService.findById(id);
      boxCache.set(id, box);
      return box;
    };

    const round4 = (num: number) => Number(num.toFixed(4));

    for (const doc of ordersData) {
      const orderDoc = doc as any;
      const subtotal = Number(orderDoc.subtotal || 0);
      const deliveryCharge = Number(orderDoc.deliveryCharge || 0);
      
      // Keep surcharges separate
      const baseCost = Number(orderDoc.logisticsCost || 0);
      const fuelCharge = round4(baseCost * 0.25);
      const fovCharge = round4(baseCost * 0.002);
      const preGst = baseCost + fuelCharge + fovCharge;
      const gstCharge = round4(preGst * 0.18);
      const actualCourierCost = round4(baseCost);

      // Calculate Zaakpay Gateway Cost (1.85% + 18% GST)
      const paymentAmount = subtotal + deliveryCharge;
      const zaakpayFee = paymentAmount * 0.0185;
      const zaakpayGst = zaakpayFee * 0.18;
      const actualZaakpayCost = round4(zaakpayFee + zaakpayGst);

      // Calculate Server Cost Share
      const serverCostAllocated = round4(serverCostPerOrder);

      // Implied MRP assuming subtotal is after 30% discount
      const impliedMRP = round4(subtotal > 0 ? subtotal / (1 - DISCOUNT_RATE) : 0);
      
      // What business actually earned
      const netRevenue = round4((subtotal + deliveryCharge) - actualCourierCost - fuelCharge - fovCharge - gstCharge - actualZaakpayCost - serverCostAllocated);
      
      // The explicit 30% discount amount
      const discountOnMRP = round4(impliedMRP - subtotal);
      
      // The hidden discount: company absorbed delivery cost + extra costs
      const netCostToBusiness = round4(actualCourierCost + fuelCharge + fovCharge + gstCharge + actualZaakpayCost + serverCostAllocated - deliveryCharge);
      
      // Total amount 'lost' from MRP
      const netDiscountAmount = round4(impliedMRP - netRevenue);
      
      // Effective percentage
      const netDiscountPct = impliedMRP > 0 ? (netDiscountAmount / impliedMRP) * 100 : 0;

      const boxInfo = await getBoxInfo(orderDoc.boxId);
      const boxName = boxInfo ? boxInfo.name : undefined;
      const boxPhotoUrl = (boxInfo && boxInfo.photos && boxInfo.photos.length > 0) ? boxInfo.photos[0] : undefined;
      const volumetricWeight = orderDoc.volumetricWeight || undefined;

      orders.push({
        orderId: orderDoc.orderId || orderDoc._id.toString(),
        orderNumber: orderDoc.orderNumber,
        subtotal,
        deliveryCharge,
        logisticsCost: actualCourierCost,
        fuelCharge,
        fovCharge,
        gstCharge,
        netRevenue,
        impliedMRP,
        discountOnMRP,
        netCostToBusiness,
        netDiscountAmount,
        netDiscountPct,
        zaakpayCost: actualZaakpayCost,
        serverCost: serverCostAllocated,
        boxName,
        boxPhotoUrl,
        volumetricWeight,
      });

      // Accumulate for summary
      summary.totalOrders++;
      summary.totalSubtotal += subtotal;
      summary.totalDeliveryChargesCollected += deliveryCharge;
      summary.totalLogisticsCost += actualCourierCost;
      summary.totalFuelCharge += fuelCharge;
      summary.totalFovCharge += fovCharge;
      summary.totalGstCharge += gstCharge;
      summary.totalNetRevenue += netRevenue;
      summary.impliedTotalMRP += impliedMRP;
      summary.totalDiscountOnMRP += discountOnMRP;
      summary.totalNetCostToBusiness += netCostToBusiness;
      summary.totalNetDiscountAmount += netDiscountAmount;
      summary.totalZaakpayCost += actualZaakpayCost;
      summary.totalServerCost += serverCostAllocated;

      if (deliveryCharge === 0) {
        summary.freeDeliveryOrdersCount++;
      } else {
        summary.paidDeliveryOrdersCount++;
      }
    }

    if (summary.impliedTotalMRP > 0) {
      summary.avgNetDiscountPct = (summary.totalNetDiscountAmount / summary.impliedTotalMRP) * 100;
    }

    return {
      month,
      year,
      summary,
      orders,
    };
  }
}
