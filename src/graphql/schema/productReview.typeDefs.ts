import { gql } from "graphql-tag";

export const ProductReviewsTypeDefs = gql`
   type ProductReview {
    id: ID!
    productId: ID
    customerId: ID
    saleId: ID
    rating: Int
    comment: String
    isVerifiedPurchase: Boolean
    createdAt: String
  }

  input CreateProductReviewInput {
    productId: ID!
    saleId: ID!
    rating: Int
    comment: String
  }

  input UpdateProductReviewInput {
    rating: Int
    comment: String
  }

  type ProductReviewResponse {
    status: Boolean!
    message: String!
    tap: String
    data: ProductReview
  }

  type ProductReviewsResponse {
    status: Boolean!
    message: String!
    tap: String
    data: [ProductReview]
    total: Int
  }

  type Query {
    productReview(id: ID!): ProductReviewResponse
    productReviews(productId: ID!): ProductReviewsResponse
  }

  type Mutation {
    createReview(input: CreateProductReviewInput!): ProductReviewResponse
    updateProductReview(
      id: ID!
      input: UpdateProductReviewInput!
    ): ProductReviewResponse
  }
`

