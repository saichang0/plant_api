import { gql } from "graphql-tag";

export const productTypeDefs = gql`
    type Product {
        id: ID!
        categoryId: Int
        name: String
        imageUrl: String
        description: String
        variety: String
        size: String
        ageMonths: Int
        stockQuantity: Int
        costPrice: Float
        salePrice: Float
        isPopular: Boolean
        isSpecialOffer: Boolean
        discountPercentage: Float
        isActive: Boolean
        createdAt: String
        updatedAt: String
        deletedAt: String
        productReviews: [ProductReview]
        isFavorite: Boolean
    }

    input ProductInput {
        categoryId: Int
        name: String
        imageUrl: String
        description: String
        variety: String
        size: String
        ageMonths: Int
        stockQuantity: Int
        costPrice: Float
        salePrice: Float
        isPopular: Boolean
        isSpecialOffer: Boolean
        discountPercentage: Float
        isActive: Boolean
    }

    input FilterInputProduct {
        isSpecialOffer: Boolean
        isPopular: Boolean
    }

    type ProductResponse {
        status: Boolean!
        message: String!
        tag: String!
        data: Product
    }

    input entityInput {
        id: ID!
    }

    type ProductsResponse {
        status: Boolean!
        message: String!
        data: [Product]
        total: Int
        tag: String!
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
        createProduct(input: ProductInput!, images: [String]): ProductResponse
        updateProduct(id: ID!, input: ProductInput!, images: [String]): ProductResponse
        deleteProduct(id: ID!): ProductResponse
    }
`