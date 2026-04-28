import { gql } from 'graphql-tag';

export const customerAddressTypeDefs = gql`
  type CustomerAddress {
    id: ID!
    customerId: ID!
    province: String!
    district: String!
    village: String!
    country: String!
    isDefault: Boolean!
    shippingService: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateCustomerAddressInput {
    province: String!
    district: String!
    village: String!
    country: String
    isDefault: Boolean
    shippingService: String
  }

  input UpdateCustomerAddressDataInput {
    province: String
    district: String
    village: String
    country: String
    isDefault: Boolean
    shippingService: String
  }

  input UpdateCustomerAddressInput {
    id: ID!
    data: UpdateCustomerAddressDataInput!
  }

  input DeleteCustomerAddressInput {
    id: ID!
  }

  type CustomerAddressResponse {
    status: Boolean!
    message: String!
    tap: String
    data: CustomerAddress
  }

  type CustomerAddressesResponse {
    status: Boolean!
    message: String!
    tap: String
    data: [CustomerAddress]
  }

  type Query {
    customerAddresses: CustomerAddressesResponse
    customerAddress(id: ID!): CustomerAddressResponse
  }

  type Mutation {
    createCustomerAddress(input: CreateCustomerAddressInput!): CustomerAddressResponse
    updateCustomerAddress(input: UpdateCustomerAddressInput!): CustomerAddressResponse
    deleteCustomerAddress(input: DeleteCustomerAddressInput!): CustomerAddressResponse
    setDefaultCustomerAddress(id: ID!): CustomerAddressResponse
  }
`;
