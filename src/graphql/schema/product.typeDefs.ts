import { gql } from "graphql-tag";

export const productTypeDefs = gql`
    type ProductView {
        id: ID!
        productId: ID!
        customerId: ID!
        source: String
        createdAt: String
    }

    type Product {
        id: ID!
        categoryId: ID
        category: Category
        name: String
        imageUrl: String
        description: String
        size: String
        ageMonths: Int
        unit: Unit
        weightPerUnit: Float
        stockQuantity: Int
        stockWeight: Float
        costPrice: Float
        salePrice: Float
        pricePerHalfBag: Float
        pricePer12Kg: Float
        pricePerKg: Float
        isPopular: Boolean
        isSpecialOffer: Boolean
        discount: Float
        isActive: Boolean
        viewsCount: Int
        createdBy: ID
        deletedBy: ID
        createdAt: String
        updatedAt: String
        deletedAt: String
        productViews: [ProductView]
        productReviews: [ProductReview]
        isFavorite: Boolean
        owner: ProductOwner
    }

    type ProductOwner {
        id: ID!
        firstName: String!
        lastName: String!
        shopName: String
        profileImageUrl: String
        bankAccountImageUrl: String
    }

    input ProductInput {
        categoryId: ID
        name: String
        imageUrl: String
        description: String
        size: String
        ageMonths: Int
        unitId: ID
        weightPerUnit: Float
        stockQuantity: Int
        stockWeight: Float
        costPrice: Float
        salePrice: Float
        pricePerHalfBag: Float
        pricePer12Kg: Float
        pricePerKg: Float
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
        publicProducts(
           keyword: String,
           paginate: PaginationInput,
           filter: FilterInputProduct,
           shopId: ID,
        ): ProductsResponse
        publicProduct(id: ID!): ProductResponse
    }

    type Mutation {
        createProduct(input: ProductInput!): ProductResponse
        updateProduct(id: ID!, input: ProductInput!): ProductResponse
        deleteProduct(id: ID!): ProductResponse
    }
`