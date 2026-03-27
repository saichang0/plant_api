import { gql } from 'graphql-tag';

export const purchaseOrderDetailTypeDefs = gql`
  type PurchaseOrderDetail {
    id: ID!
    orderId: Int!
    productId: Int!
    quantity: Int!
    order: PurchaseOrder
    product: Product
  }

  input CreatePurchaseOrderDetailInput {
    orderId: Int!
    productId: Int!
    quantity: Int!
  }

  input UpdatePurchaseOrderDetailInput {
    id: ID!
    data: CreatePurchaseOrderDetailInput!
  }

  input DeletePurchaseOrderDetailInput {
    id: ID!
  }

  type PurchaseOrderDetailResponse {
    status: Boolean!
    message: String!
    purchaseOrderDetail: PurchaseOrderDetail
  }

  type PurchaseOrderDetailsResponse {
    status: Boolean!
    message: String!
    purchaseOrderDetails: [PurchaseOrderDetail]
  }

  type Query {
    getPurchaseOrderDetail(id: ID!): PurchaseOrderDetailResponse
    getPurchaseOrderDetails: PurchaseOrderDetailsResponse
  }

  type Mutation {
    createPurchaseOrderDetail(input: CreatePurchaseOrderDetailInput!): PurchaseOrderDetailResponse
    updatePurchaseOrderDetail(input: UpdatePurchaseOrderDetailInput!): PurchaseOrderDetailResponse
    deletePurchaseOrderDetail(input: DeletePurchaseOrderDetailInput!): PurchaseOrderDetailResponse
  }
`;