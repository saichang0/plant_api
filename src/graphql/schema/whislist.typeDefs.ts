import { gql } from 'graphql-tag';

export const wishlistTypeDefs = gql`
  type Wishlist {
    id: String!
    customerId: String!
    productId: String!
    product: Product
  }

  type iswhislist {
    id: String!
    customerId: String!
    productId: String!
    isFavorite: Boolean!
  }

  type ToggleWishlistResponse {
    status: Boolean!
    message: String!
    tap: String
    data: iswhislist
  }

  type WishlistsResponse {
    status: Boolean!
    message: String!
    tap: String
    total: String!
    data: [Wishlist]!
  }

  extend type Query {
    wishlists: WishlistsResponse!
  }

  extend type Mutation {
    toggleWishlist(productId: String!): ToggleWishlistResponse!
  }
`;