import { gql } from "graphql-tag";

export const ProductReviewsTypeDefs = gql`
   type ProductReview {
    id: ID!
    productId: Int
    customerId: Int
    saleId: Int
    rating: Int
    comment: String
    isVerifiedPurchase: Boolean
    createdAt: String
  }

  input CreateProductReviewInput {
    productId: Int!
    saleId: Int!
    rating: Int
    comment: String
  }

  input UpdateProductReviewInput {
    rating: Int
    comment: String
  }

  type ProductReviewResponse {
    tap: String!
    status: Boolean!
    message: String!
    data: ProductReview
  }

  type ProductReviewsResponse {
    status: Boolean!
    message: String!
    data: [ProductReview]
    total: Int
  }

  type Query {
    productReview(id: ID!): ProductReviewResponse
    productReviews(productId: Int!): ProductReviewsResponse
  }

  type Mutation {
    createReview(input: CreateProductReviewInput!): ProductReviewResponse
    updateProductReview(
      id: ID!
      input: UpdateProductReviewInput!
    ): ProductReviewResponse
  }
`

