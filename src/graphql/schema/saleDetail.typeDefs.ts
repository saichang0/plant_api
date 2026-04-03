import { gql } from 'graphql-tag';

export const saleDetailTypeDefs = gql`
  type SaleDetail {
    id: ID!
    saleId: ID!
    productId: ID!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
    sale: Sale
    product: Product
  }

  input CreateSaleDetailInput {
    saleId: ID!
    productId: ID!
    quantity: Int!
    unitPrice: Float!
    totalPrice: Float!
  }

  input UpdateSaleDetailInput {
    id: ID!
    data: CreateSaleDetailInput!
  }

  input DeleteSaleDetailInput {
    id: ID!
  }

  type SaleDetailResponse {
    status: Boolean!
    message: String!
    tap: String
    saleDetail: SaleDetail
  }

  type SaleDetailsResponse {
    status: Boolean!
    message: String!
    tap: String
    saleDetails: [SaleDetail]
  }

  type Query {
    getSaleDetail(id: ID!): SaleDetailResponse
    getSaleDetails: SaleDetailsResponse
  }

  type Mutation {
    createSaleDetail(input: CreateSaleDetailInput!): SaleDetailResponse
    updateSaleDetail(input: UpdateSaleDetailInput!): SaleDetailResponse
    deleteSaleDetail(input: DeleteSaleDetailInput!): SaleDetailResponse
  }
`;