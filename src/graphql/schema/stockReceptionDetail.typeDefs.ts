import { gql } from 'graphql-tag';

export const stockReceptionDetailTypeDefs = gql`
  type StockReceptionDetail {
    id: ID!
    receptionId: Int!
    productId: Int!
    quantityReceived: Int!
    actualCostPrice: Float!
    status: String!
    reception: StockReception
    product: Product
  }

  input CreateStockReceptionDetailInput {
    receptionId: Int!
    productId: Int!
    quantityReceived: Int!
    actualCostPrice: Float!
    status: String
  }

  input UpdateStockReceptionDetailInput {
    id: ID!
    data: CreateStockReceptionDetailInput!
  }

  input DeleteStockReceptionDetailInput {
    id: ID!
  }

  type StockReceptionDetailResponse {
    status: Boolean!
    message: String!
    stockReceptionDetail: StockReceptionDetail
  }

  type StockReceptionDetailsResponse {
    status: Boolean!
    message: String!
    stockReceptionDetails: [StockReceptionDetail]
  }

  type Query {
    getStockReceptionDetail(id: ID!): StockReceptionDetailResponse
    getStockReceptionDetails: StockReceptionDetailsResponse
  }

  type Mutation {
    createStockReceptionDetail(input: CreateStockReceptionDetailInput!): StockReceptionDetailResponse
    updateStockReceptionDetail(input: UpdateStockReceptionDetailInput!): StockReceptionDetailResponse
    deleteStockReceptionDetail(input: DeleteStockReceptionDetailInput!): StockReceptionDetailResponse
  }
`;