import { gql } from 'graphql-tag';

export const deliveryTypeDefs = gql`
  type Delivery {
    id: ID!
    saleId: Int!
    deliveryService: String!
    trackingNumber: String
    status: String!
    shippedAt: String
    sale: Sale
  }

  input CreateDeliveryInput {
    saleId: Int!
    deliveryService: String!
    trackingNumber: String
    status: String
  }

  input UpdateDeliveryInput {
    id: ID!
    data: CreateDeliveryInput!
  }

  input DeleteDeliveryInput {
    id: ID!
  }

  type DeliveryResponse {
    status: Boolean!
    message: String!
    delivery: Delivery
  }

  type DeliveriesResponse {
    status: Boolean!
    message: String!
    deliveries: [Delivery]
  }

  type Query {
    getDelivery(id: ID!): DeliveryResponse
    getDeliveries: DeliveriesResponse
  }

  type Mutation {
    createDelivery(input: CreateDeliveryInput!): DeliveryResponse
    updateDelivery(input: UpdateDeliveryInput!): DeliveryResponse
    deleteDelivery(input: DeleteDeliveryInput!): DeliveryResponse
  }
`;