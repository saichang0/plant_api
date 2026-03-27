import { gql } from 'graphql-tag';

export const wishlistTypeDefs = gql`
  type Wishlist {
    _id: String!
    userId: String!
    productId: String!
    product: Product 
  }

  type iswhislist {
   _id: String!
    userId: String!
    productId: String!
    isFavorite: Boolean!
  }

  type ToggleWishlistResponse {
    status: Boolean!
    message: String!
    tag: String!
    data: iswhislist
  }

  type WishlistsResponse {
    status: Boolean!
    message: String!
    tag: String!
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