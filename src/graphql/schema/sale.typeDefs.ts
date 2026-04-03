import { gql } from 'graphql-tag';

export const saleTypeDefs = gql`
  type Sale {
    id: ID!
    customerId: ID!
    userId: ID!
    saleDate: String!
    totalAmount: Float!
    status: String!
    customer: Customer
    user: User
    saleDetails: [SaleDetail]
    payments: [Payment]
    deliveries: [Delivery]
    productReviews: [ProductReview]
  }

  input CreateSaleInput {
    customerId: ID!
    userId: ID!
    totalAmount: Float!
    status: String
  }

  input UpdateSaleInput {
    id: ID!
    data: CreateSaleInput!
  }

  input DeleteSaleInput {
    id: ID!
  }

  type SaleResponse {
    status: Boolean!
    message: String!
    tap: String
    sale: Sale
  }

  type SalesResponse {
    status: Boolean!
    message: String!
    tap: String
    sales: [Sale]
  }

  type Query {
    getSale(id: ID!): SaleResponse
    getSales: SalesResponse
  }

  type Mutation {
    createSale(input: CreateSaleInput!): SaleResponse
    updateSale(input: UpdateSaleInput!): SaleResponse
    deleteSale(input: DeleteSaleInput!): SaleResponse
  }
`;