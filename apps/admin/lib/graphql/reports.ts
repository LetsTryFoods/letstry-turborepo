import { gql } from "@apollo/client";

export const GET_ORDER_REPORTS = gql`
  query GetOrderReports($period: String!) {
    getOrderReports(period: $period) {
      summary {
        totalRevenue
        totalOrders
        totalCustomers
        avgOrderValue
        revenueGrowth
        ordersGrowth
        customersGrowth
      }
      dailySales {
        date
        orders
        revenue
      }
      topProducts {
        _id
        name
        image
        soldQuantity
        revenue
      }
      topCustomers {
        _id
        name
        email
        totalOrders
        totalSpent
      }
      categorySales {
        category
        revenue
        percentage
      }
      platformStats {
        website
        app
      }
    }
  }
`;

export const GET_SHIPPING_INSIGHTS = gql`
  query GetShippingInsights {
    getShippingInsights {
      avgWeight
      mostUsedBox
      maxDeliveryDays
      avgDeliveryDays
    }
  }
`;

export const GET_SALES_BY_STATE = gql`
  query GetSalesByState($period: String!) {
    getSalesByState(period: $period) {
      state
      orders
      revenue
    }
  }
`;
