import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  enum UserStatus {
    ACTIVE
    INACTIVE
  }

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    phoneNumber: String!
    profileImageUrl: String
    shopName: String
    email: String
    role: String!
    status: UserStatus
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
    email: String
    phoneNumber: String!
    profileImageUrl: String
    shopName: String
    role: String
    status: UserStatus
  }

    input UpdateUser {
    firstName: String
    lastName: String
    password: String
    profileImageUrl: String
    shopName: String
    role: String
    status: UserStatus
  }

  input UpdateUserInput {
    id: ID!
    data: UpdateUser!
  }

  input DeleteUserInput {
    id: ID!
  }

  input LoginUserInput {
    identifier: String!
    password: String!
  }

  input UserRequestOTPInput {
    email: String
  }

  input UserVerifyOTPInput {
    email: String
    otp: String!
  }

  input ResetPassword {
    email: String
    otp: String!
    newPassword: String!
    confirmPassword: String!
  }

  type UserResponse {
    status: Boolean!
    message: String!
    tap: String
    user: User
    accessToken: String
    refreshToken: String
  }

  type OTPResponse {
    status: Boolean!
    message: String!
    tap: String
  }

  type UsersResponse {
    status: Boolean!
    message: String!
    tap: String
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
    requestUserOTP(data: UserRequestOTPInput!): OTPResponse
    verifyUserOTP(data: UserVerifyOTPInput!): OTPResponse
    resetUserPassword(data: ResetPassword!): UserResponse
  }
`;