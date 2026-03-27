import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    phoneNumber: String!
    profileImageUrl: String
    shopName: String
    role: String!
    status: String!
    otp: String
    otpExpiry: String
    createdAt: String!
    updatedAt: String!
    sales: [Sale]
    purchaseOrders: [PurchaseOrder]
    stockReceptions: [StockReception]
  }

  input CreateUserInput {
    firstName: String!
    lastName: String!
    password: String!
    phoneNumber: String!
    profileImageUrl: String
    shopName: String
    role: String
    status: String
  }

  input UpdateUserInput {
    id: ID!
    data: CreateUserInput!
  }

  input DeleteUserInput {
    id: ID!
  }

  input LoginUserInput {
    phoneNumber: String!
    password: String!
  }

  type UserResponse {
    status: Boolean!
    message: String!
    user: User
    accessToken: String
    refreshToken: String
  }

  type UsersResponse {
    status: Boolean!
    message: String!
    users: [User]
  }

  type Query {
    getUser(id: ID!): UserResponse
    getUsers: UsersResponse
  }

  type Mutation {
    createUser(input: CreateUserInput!): UserResponse
    updateUser(input: UpdateUserInput!): UserResponse
    deleteUser(input: DeleteUserInput!): UserResponse
    loginUser(input: LoginUserInput!): UserResponse
  }
`;