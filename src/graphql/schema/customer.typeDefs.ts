import { gql } from 'graphql-tag';

export const CustomerTypeDefs = gql`
  type Customer {
    id: ID!
    firstName: String!
    lastName: String
    profileImageUrl: String
    phoneNumber: String!
    email: String!
    address: String
    otp: String
    otpExpiry: String
    createdAt: String
    updatedAt: String
  }

  type AuthResponse {
    status: Boolean!
    message: String!
    tap: String
    customer: Customer
    accessToken: String
    refreshToken: String
  }

input createCustomerInput {
  firstName: String!
  lastName: String
  profileImageUrl: String
  phoneNumber: String!
  email: String!
  password: String!
  address: String
}

input updateCustomer {
  firstName: String
  lastName: String
  profileImageUrl: String
  password: String
  address: String
}

input UpdateCustomerInput {
  id: ID!
  data: updateCustomer!
}

input DeleteCustomerInput {
  id: ID!
}

input RequestOTPInput {
  email: String!
}

input VerifyOTPInput {
  email: String!
  otp: String!
}

input CustomerLoginInput {
  identifier: String!
  password: String!
}

input ResetPasswordInput {
  email: String!
  otp: String!
  password: String!
  confirmPassword: String!
}

type Response {
  status: Boolean!
  message: String!
  tap: String
}

type Query {
  customer(id: ID!): AuthResponse!
}

type Mutation {
  createCustomer(data:createCustomerInput!): AuthResponse!
  updateCustomer(data: UpdateCustomerInput!): AuthResponse!
  deleteCustomer(data: DeleteCustomerInput!): AuthResponse!
  loginCustomer(data: CustomerLoginInput!): AuthResponse!
  requestOTP(data: RequestOTPInput!): Response!  
  verifyOTP(data: VerifyOTPInput!): Response!
  resetPassword(data: ResetPasswordInput!): AuthResponse!
}

`;
