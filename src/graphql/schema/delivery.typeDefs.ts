import { gql } from 'graphql-tag';

export const deliveryTypeDefs = gql`
  type Delivery {
    id: ID!
    saleId: ID!
    deliveryService: String!
    branch: String
    trackingNumber: String
    status: DeliveryStatus!
    shippedAt: String
    sale: Sale
  }

  input CreateDeliveryInput {
    saleId: ID!
    deliveryService: String!
    branch: String
    trackingNumber: String
    status: DeliveryStatus!
  }

  enum DeliveryStatus {
    PACKING
    SHIPPING
    SHIPPED
    DELIVERED
  }

  input UpdateDeliveryDataInput {
    deliveryService: String
    branch: String
    trackingNumber: String
    status: DeliveryStatus
  }

  input UpdateDeliveryInput {
    id: ID!
    data: UpdateDeliveryDataInput!
  }

  input DeleteDeliveryInput {
    id: ID!
  }

  type DeliveryResponse {
    status: Boolean!
    message: String!
    tap: String
    delivery: Delivery
  }

  type DeliveriesResponse {
    status: Boolean!
    message: String!
    tap: String
    total: Int
    deliveries: [Delivery]
  }

  type Query {
    getDelivery(id: ID!): DeliveryResponse
    # Owner-scoped. Pass saleStatus="confirmed" + deliveryStatus="packing"
    # to get orders the shop has confirmed but not yet shipped.
    getDeliveries(saleStatus: String, deliveryStatus: String): DeliveriesResponse
  }

  type Mutation {
    createDelivery(input: CreateDeliveryInput!): DeliveryResponse
    updateDelivery(input: UpdateDeliveryInput!): DeliveryResponse
    deleteDelivery(input: DeleteDeliveryInput!): DeliveryResponse
  }
`;