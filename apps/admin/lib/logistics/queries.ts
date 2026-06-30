import { gql } from '@apollo/client';

export const GET_MONTHLY_LOGISTICS_ANALYTICS = gql`
  query GetMonthlyLogisticsAnalytics($month: Float!, $year: Float!) {
    getMonthlyLogisticsAnalytics(month: $month, year: $year) {
      month
      year
      totalCost
      totalBaseCost
      fuelCharge
      fovCharge
      gstCharge
      totalVolumetricWeight
      totalBoxesUsed
      regionStats {
        region
        count
        baseCost
        volumetricWeight
        totalCost
      }
      boxUsage {
        boxId
        boxName
        count
        costGenerated
      }
      mostUsedBox {
        boxId
        boxName
        count
        costGenerated
      }
      leastUsedBox {
        boxId
        boxName
        count
        costGenerated
      }
    }
  }
`;

export const GET_MONTHLY_DISCOUNT_ANALYTICS = gql`
  query GetMonthlyDiscountAnalytics($month: Float!, $year: Float!) {
    getMonthlyDiscountAnalytics(month: $month, year: $year) {
      month
      year
      summary {
        totalOrders
        totalSubtotal
        totalDeliveryChargesCollected
        totalLogisticsCost
        totalZaakpayCost
        totalServerCost
        totalNetRevenue
        impliedTotalMRP
        totalDiscountOnMRP
        totalNetCostToBusiness
        totalNetDiscountAmount
        avgNetDiscountPct
        freeDeliveryOrdersCount
        paidDeliveryOrdersCount
      }
      orders {
        orderId
        orderNumber
        subtotal
        deliveryCharge
        logisticsCost
        zaakpayCost
        serverCost
        netRevenue
        impliedMRP
        discountOnMRP
        netCostToBusiness
        netDiscountAmount
        netDiscountPct
        boxName
        boxPhotoUrl
        volumetricWeight
      }
    }
  }
`;
