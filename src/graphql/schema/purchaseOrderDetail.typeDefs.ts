import { gql } from 'graphql-tag';

export const purchaseOrderDetailTypeDefs = gql`
  type PurchaseOrderDetail {
    id: ID!
    orderId: ID!
    productId: ID!
    quantity: Int!
    unit: Unit
    order: PurchaseOrder
    product: Product
  }

  input CreatePurchaseOrderDetailInput {
    orderId: ID!
    productId: ID!
    quantity: Int!
    unitId: ID
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
    tap: String
    purchaseOrderDetail: PurchaseOrderDetail
  }

  type PurchaseOrderDetailsResponse {
    status: Boolean!
    message: String!
    tap: String
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
