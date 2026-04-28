import { gql } from 'graphql-tag';

export const unitTypeDefs = gql`
  type Unit {
    id: ID!
    name: String!
    weightInGrams: Float
    isActive: Boolean!
    createdBy: String
    creator: User
    createdAt: String!
    updatedAt: String!
  }

  input CreateUnitInput {
    name: String!
    weightInGrams: Float
    isActive: Boolean
  }

  input UpdateUnitData {
    name: String
    weightInGrams: Float
    isActive: Boolean
  }

  input UpdateUnitInput {
    id: ID!
    data: UpdateUnitData!
  }

  input DeleteUnitInput {
    id: ID!
  }

  type UnitResponse {
    status: Boolean!
    message: String!
    tap: String
    unit: Unit
  }

  type UnitsResponse {
    status: Boolean!
    message: String!
    tap: String
    units: [Unit]
  }

  type Query {
    getUnit(id: ID!): UnitResponse
    getUnits: UnitsResponse
  }

  type Mutation {
    createUnit(input: CreateUnitInput!): UnitResponse
    updateUnit(input: UpdateUnitInput!): UnitResponse
    deleteUnit(input: DeleteUnitInput!): UnitResponse
  }
`;
