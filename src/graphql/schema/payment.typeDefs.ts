import { gql } from 'graphql-tag';

export const paymentTypeDefs = gql`
  type Payment {
    id: ID!
    saleId: Int!
    paymentMethod: String!
    currency: String!
    amount: Float!
    slipImageUrl: String
    paidAt: String!
    sale: Sale
  }

  input CreatePaymentInput {
    saleId: Int!
    paymentMethod: String!
    currency: String
    amount: Float!
    slipImageUrl: String
  }

  input UpdatePaymentInput {
    id: ID!
    data: CreatePaymentInput!
  }

  input DeletePaymentInput {
    id: ID!
  }

  type PaymentResponse {
    status: Boolean!
    message: String!
    payment: Payment
  }

  type PaymentsResponse {
    status: Boolean!
    message: String!
    payments: [Payment]
  }

  type Query {
    getPayment(id: ID!): PaymentResponse
    getPayments: PaymentsResponse
  }

  type Mutation {
    createPayment(input: CreatePaymentInput!): PaymentResponse
    updatePayment(input: UpdatePaymentInput!): PaymentResponse
    deletePayment(input: DeletePaymentInput!): PaymentResponse
  }
`;