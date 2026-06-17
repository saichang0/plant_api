import { gql } from 'graphql-tag';

export const historyTypeDefs = gql`
  type StockMovement {
    id: ID!
    productId: ID!
    userId: ID!
    change: Int!
    quantityBefore: Int!
    quantityAfter: Int!
    reason: String!
    referenceId: ID
    referenceType: String
    note: String
    createdAt: String
    product: Product
    user: User
  }

  type StockMovementsResponse {
    status: Boolean!
    message: String!
    tap: String
    data: [StockMovement]
    total: Int
  }

  input HistoryFilter {
    from: String
    to: String
    productId: ID
    reason: String
    limit: Int = 50
    offset: Int = 0
  }

  extend type Query {
    stockMovements(filter: HistoryFilter): StockMovementsResponse
    salesHistory(filter: HistoryFilter, status: String): SalesResponse
  }
`;
