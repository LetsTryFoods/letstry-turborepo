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
    }
  }
`;
