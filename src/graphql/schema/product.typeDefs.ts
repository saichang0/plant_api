import { gql } from "graphql-tag";

export const productTypeDefs = gql`
    type Product {
        id: ID!
        categoryId: ID
        name: String
        imageUrl: String
        description: String
        size: String
        ageMonths: Int
        stockQuantity: Int
        costPrice: Float
        salePrice: Float
        isPopular: Boolean
        isSpecialOffer: Boolean
        discount: Float
        isActive: Boolean
        createdBy: ID
        deletedBy: ID
        createdAt: String
        updatedAt: String
        deletedAt: String
        productReviews: [ProductReview]
        productViews: [ProductReview]
        isFavorite: Boolean
    }

    input ProductInput {
        categoryId: ID
        name: String
        imageUrl: String
        description: String
        size: String
        ageMonths: Int
        stockQuantity: Int
        costPrice: Float
        salePrice: Float
        isPopular: Boolean
        isSpecialOffer: Boolean
        discount: Float
        isActive: Boolean
    }

    input FilterInputProduct {
        isSpecialOffer: Boolean
        isPopular: Boolean
    }

    type ProductResponse {
        status: Boolean!
        message: String!
        tap: String
        data: Product
    }

    input entityInput {
        id: ID!
    }

    type ProductsResponse {
        status: Boolean!
        message: String!
        tap: String
        data: [Product]
        total: Int
    }

    input ProductFilterInput {
        name: String
        price: Float
    }

    input PaginationInput {
       page: Int = 1
       limit: Int = 50
    }

    type Query {
        products(
           keyword: String, 
           paginate: PaginationInput,
           filter: FilterInputProduct,
        ): ProductsResponse
        product(where: entityInput): ProductResponse
    }

    type Mutation {
        createProduct(input: ProductInput!): ProductResponse
        updateProduct(id: ID!, input: ProductInput!): ProductResponse
        deleteProduct(id: ID!): ProductResponse
    }
`