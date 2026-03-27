import { gql } from 'graphql-tag';

export const stockReceptionTypeDefs = gql`
  type StockReception {
    id: ID!
    purchaseOrderId: Int
    userId: Int!
    receptionDate: String!
    totalActualPrice: Float!
    purchaseOrder: PurchaseOrder
    user: User
    stockReceptionDetails: [StockReceptionDetail]
  }

  input CreateStockReceptionInput {
    purchaseOrderId: Int
    userId: Int!
    totalActualPrice: Float!
  }

  input UpdateStockReceptionInput {
    id: ID!
    data: CreateStockReceptionInput!
  }

  input DeleteStockReceptionInput {
    id: ID!
  }

  type StockReceptionResponse {
    status: Boolean!
    message: String!
    stockReception: StockReception
  }

  type StockReceptionsResponse {
    status: Boolean!
    message: String!
    stockReceptions: [StockReception]
  }

  type Query {
    getStockReception(id: ID!): StockReceptionResponse
    getStockReceptions: StockReceptionsResponse
  }

  type Mutation {
    createStockReception(input: CreateStockReceptionInput!): StockReceptionResponse
    updateStockReception(input: UpdateStockReceptionInput!): StockReceptionResponse
    deleteStockReception(input: DeleteStockReceptionInput!): StockReceptionResponse
  }
`;