import { gql } from 'graphql-tag';

export const bankAccountTypeDefs = gql`
  type BankAccount {
    id: ID!
    userId: ID!
    bankName: String!
    qrImageUrl: String!
    createdAt: String
    updatedAt: String
  }

  input CreateBankAccountInput {
    bankName: String!
    qrImageUrl: String!
  }

  input UpdateBankAccountInput {
    bankName: String
    qrImageUrl: String
  }

  type BankAccountResponse {
    status: Boolean!
    message: String!
    tap: String
    data: BankAccount
  }

  type BankAccountsResponse {
    status: Boolean!
    message: String!
    tap: String
    data: [BankAccount]
    total: Int
  }

  extend type Query {
    # Bank accounts owned by the authed shop user (POS).
    bankAccounts: BankAccountsResponse
    # Bank accounts for a specific shop owner — used by the mobile app at checkout.
    shopBankAccounts(userId: ID!): BankAccountsResponse
  }

  extend type Mutation {
    createBankAccount(input: CreateBankAccountInput!): BankAccountResponse
    updateBankAccount(id: ID!, input: UpdateBankAccountInput!): BankAccountResponse
    deleteBankAccount(id: ID!): BankAccountResponse
  }
`;
