import { gql } from 'graphql-tag';

export const purchaseOrderTypeDefs = gql`
  type PurchaseOrder {
    id: ID!
    supplierId: Int!
    userId: Int!
    orderDate: String!
    totalPrice: Float!
    status: String!
    supplier: Supplier
    user: User
    purchaseOrderDetails: [PurchaseOrderDetail]
    stockReceptions: [StockReception]
  }

  input CreatePurchaseOrderInput {
    supplierId: Int!
    userId: Int!
    totalPrice: Float!
    status: String
  }

  input UpdatePurchaseOrderInput {
    id: ID!
    data: CreatePurchaseOrderInput!
  }

  input DeletePurchaseOrderInput {
    id: ID!
  }

  type PurchaseOrderResponse {
    status: Boolean!
    message: String!
    purchaseOrder: PurchaseOrder
  }

  type PurchaseOrdersResponse {
    status: Boolean!
    message: String!
    purchaseOrders: [PurchaseOrder]
  }

  type Query {
    getPurchaseOrder(id: ID!): PurchaseOrderResponse
    getPurchaseOrders: PurchaseOrdersResponse
  }

  type Mutation {
    createPurchaseOrder(input: CreatePurchaseOrderInput!): PurchaseOrderResponse
    updatePurchaseOrder(input: UpdatePurchaseOrderInput!): PurchaseOrderResponse
    deletePurchaseOrder(input: DeletePurchaseOrderInput!): PurchaseOrderResponse
  }
`;