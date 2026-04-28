import { gql } from 'graphql-tag';

export const reportTypeDefs = gql`
  type ProfitReport {
    grossRevenue: Float!
    totalCost: Float!
    netProfit: Float!
    totalOrders: Int!
    profitMargin: Float!
  }

  type TopSellingProduct {
    productId: ID!
    name: String!
    imageUrl: String
    categoryName: String
    unitName: String
    totalQuantity: Float!
    totalRevenue: Float!
  }

  type SalesByCategory {
    categoryId: ID!
    categoryName: String!
    totalRevenue: Float!
    totalOrders: Int!
    percentage: Float!
  }

  type PaymentBreakdown {
    paymentMethod: String!
    currency: String!
    totalAmount: Float!
    transactionCount: Int!
    percentage: Float!
  }

  type OrderStatusSummary {
    status: String!
    count: Int!
    totalAmount: Float!
    percentage: Float!
  }

  type ReceiptItem {
    productName: String!
    quantity: Float!
    unitName: String
    weightGrams: Float
    unitPrice: Float!
    totalPrice: Float!
  }

  type Receipt {
    saleId: ID!
    saleDate: String!
    customerName: String
    staffName: String
    items: [ReceiptItem!]!
    subTotal: Float!
    taxAmount: Float!
    discountAmount: Float!
    totalAmount: Float!
    status: String!
    payments: [PaymentInfo!]
  }

  type PaymentInfo {
    method: String!
    currency: String!
    amount: Float!
  }

  type ReportData {
    profit: ProfitReport!
    topProducts: [TopSellingProduct!]!
    salesByCategory: [SalesByCategory!]!
    paymentBreakdown: [PaymentBreakdown!]!
    orderStatus: [OrderStatusSummary!]!
    receipts: [Receipt!]!
  }

  type ReportResponse {
    status: Boolean!
    message: String!
    data: ReportData
  }

  type Query {
    getReport(startDate: String, endDate: String): ReportResponse
  }
`;
