import { gql } from 'graphql-tag';

export const stockReceptionTypeDefs = gql`
  type StockReception {
    id: ID!
    purchaseOrderId: ID
    userId: ID!
    receptionDate: String!
    totalActualPrice: Float!
    purchaseOrder: PurchaseOrder
    user: User
    stockReceptionDetails: [StockReceptionDetail]
  }

  input ConfirmItemInput {
    productId: ID!
    quantityReceived: Int!
    actualCostPrice: Float!
    status: String!
  }

  input ConfirmPurchaseOrderInput {
    purchaseOrderId: ID!
    items: [ConfirmItemInput!]!
  }

  input CreateStockReceptionInput {
    purchaseOrderId: ID
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
    tap: String
    stockReception: StockReception
  }

  type StockReceptionsResponse {
    status: Boolean!
    message: String!
    tap: String
    stockReceptions: [StockReception]
  }

  type Query {
    getStockReception(id: ID!): StockReceptionResponse
    getStockReceptions: StockReceptionsResponse
  }

  type Mutation {
    confirmPurchaseOrder(input: ConfirmPurchaseOrderInput!): StockReceptionResponse
    createStockReception(input: CreateStockReceptionInput!): StockReceptionResponse
    updateStockReception(input: UpdateStockReceptionInput!): StockReceptionResponse
    deleteStockReception(input: DeleteStockReceptionInput!): StockReceptionResponse
  }
`;
