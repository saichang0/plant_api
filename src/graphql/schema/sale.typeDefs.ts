import { gql } from 'graphql-tag';

export const saleTypeDefs = gql`
  type Sale {
    id: ID!
    customerId: ID
    userId: ID!
    saleDate: String!
    totalAmount: Float!
    taxAmount: Float
    discountAmount: Float
    status: String!
    customerName: String
    note: String
    customerAddressId: ID
    customerAddress: CustomerAddress
    updatedAt: String
    customer: Customer
    user: User
    saleDetails: [SaleDetail]
    payments: [Payment]
    deliveries: [Delivery]
    productReviews: [ProductReview]
  }

  input CreateSaleInput {
    customerId: ID
    userId: ID!
    totalAmount: Float!
    taxAmount: Float
    discountAmount: Float
    status: String
    customerName: String
    note: String
  }

  input SaleItemInput {
    productId: ID!
    quantity: Float!
    unitId: ID
    unit: String
    weightGrams: Float
    unitPrice: Float!
    totalPrice: Float!
    note: String
  }

  input PaymentInput {
    paymentMethod: String!
    currency: String!
    amount: Float!
    slipImageUrl: String
  }

  input CreateFullSaleInput {
    customerId: ID
    userId: ID!
    customerName: String
    note: String
    taxAmount: Float
    discountAmount: Float
    status: String
    items: [SaleItemInput!]!
    payments: [PaymentInput!]
  }

  input UpdateSaleInput {
    id: ID!
    data: UpdateSaleDataInput!
  }

  input UpdateSaleDataInput {
    customerId: ID
    userId: ID
    totalAmount: Float
    taxAmount: Float
    discountAmount: Float
    status: String
    customerName: String
    note: String
  }

  input DeleteSaleInput {
    id: ID!
  }

  # Customer-facing order input (mobile app)
  input PlaceOrderItemInput {
    productId: ID!
    quantity: Float!
    unitId: ID
    unit: String
    weightGrams: Float
    unitPrice: Float!
    totalPrice: Float!
    note: String
  }

  input PlaceOrderInput {
    customerAddressId: ID
    note: String
    items: [PlaceOrderItemInput!]!
    payments: [PaymentInput!]
    deliveryService: String
    deliveryBranch: String
  }

  type SaleResponse {
    status: Boolean!
    message: String!
    tap: String
    sale: Sale
  }

  type SalesResponse {
    status: Boolean!
    message: String!
    tap: String
    sales: [Sale]
    total: Int
  }

  type Query {
    getSale(id: ID!): SaleResponse
    getSales(status: String, limit: Int, offset: Int): SalesResponse
    # Customer-facing
    myOrders(status: String, limit: Int, offset: Int): SalesResponse
    myOrder(id: ID!): SaleResponse
  }

  type Mutation {
    createSale(input: CreateSaleInput!): SaleResponse
    createFullSale(input: CreateFullSaleInput!): SaleResponse
    updateSale(input: UpdateSaleInput!): SaleResponse
    deleteSale(input: DeleteSaleInput!): SaleResponse
    # Customer-facing
    placeOrder(input: PlaceOrderInput!): SaleResponse
    # Customer marks their own order as received → status becomes "completed"
    confirmOrderReceived(id: ID!): SaleResponse
  }
`;
