import { gql } from 'graphql-tag';

export const SupplierTypeDefs = gql`
  type Supplier {
    id: ID!
    name: String!
    phoneNumber: String!
    email: String!
    address: String!
    purchaseOrders: [PurchaseOrder]
  }

  input CreateSupplierInput {
    name: String!
    phoneNumber: String!
    email: String!
    address: String!
  }

  input UpdateSupplierInput {
    id: ID!
    data: CreateSupplierInput!
  }

  input DeleteSupplierInput {
    id: ID!
  }

  type SupplierResponse {
    status: Boolean!
    message: String!
    supplier: Supplier
  }

  type SuppliersResponse {
    status: Boolean!
    message: String!
    suppliers: [Supplier]
  }

  type Query {
    getSupplier(id: ID!): SupplierResponse
    getSuppliers: SuppliersResponse
  }

  type Mutation {
    createSupplier(input: CreateSupplierInput!): SupplierResponse
    updateSupplier(input: UpdateSupplierInput!): SupplierResponse
    deleteSupplier(input: DeleteSupplierInput!): SupplierResponse
  }
`;