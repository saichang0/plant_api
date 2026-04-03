import { gql } from 'graphql-tag';

export const categoryTypeDefs = gql`
  type Category {
    id: ID!
    name: String!
    products: [Product]
  }

  input CreateCategoryInput {
    name: String!
  }

  input UpdateCategoryInput {
    id: ID!
    data: CreateCategoryInput!
  }

  input DeleteCategoryInput {
    id: ID!
  }

  type CategoryResponse {
    status: Boolean!
    message: String!
    tap: String
    category: Category
  }

  type CategoriesResponse {
    status: Boolean!
    message: String!
    tap: String
    categories: [Category]
  }

  type Query {
    getCategory(id: ID!): CategoryResponse
    getCategories: CategoriesResponse
  }

  type Mutation {
    createCategory(input: CreateCategoryInput!): CategoryResponse
    updateCategory(input: UpdateCategoryInput!): CategoryResponse
    deleteCategory(input: DeleteCategoryInput!): CategoryResponse
  }
`;