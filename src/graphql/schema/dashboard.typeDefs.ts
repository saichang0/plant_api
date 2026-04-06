import { gql } from 'graphql-tag';

export const dashboardTypeDefs = gql`
  type DailyStat {
    date: String!
    totalSales: Float!
    orderCount: Int!
  }

  type TopProduct {
    productId: ID!
    name: String!
    imageUrl: String
    totalQuantity: Int!
    totalRevenue: Float!
  }

  type DashboardData {
    todaySales: Float!
    todayOrders: Int!
    weekSales: Float!
    weekOrders: Int!
    monthSales: Float!
    monthOrders: Int!
    totalProducts: Int!
    lowStockCount: Int!
    pendingPurchaseOrders: Int!
    dailyStats: [DailyStat!]!
    weeklyStats: [DailyStat!]!
    topProducts: [TopProduct!]!
  }

  type DashboardResponse {
    status: Boolean!
    message: String!
    data: DashboardData
  }

  type Query {
    getDashboard: DashboardResponse
  }
`;
