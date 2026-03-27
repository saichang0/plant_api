import jwt from "jsonwebtoken";
import { requireAuth } from "@/requireAuth.js";
import { msg } from '../../constants/massages.js';
import { AppDataSource } from '../../config/db.js';
import { Products } from "../models/product.entity.js";
import { Wishlists } from "../models/wishList.entity.js";
import { deleteFromCloudinary, uploadToCloudinary } from "@/utils/uploadImage.js";
import { ProductReviews } from "../models/productReview.entity.js";
import { Like, In } from 'typeorm';

const productRepository = AppDataSource.getRepository(Products);
const wishlistRepository = AppDataSource.getRepository(Wishlists);
const productViewRepository = AppDataSource.getRepository(ProductReviews)

export const productResolver = {
    Query: {
        products: async (_: any, args: any, context: any) => {
            try {
                const authUserId = requireAuth(context);

                const { keyword, filter, paginate } = args;
                const page = paginate?.page || 1;
                const limit = paginate?.limit || 50;
                const skip = (page - 1) * limit;

                let whereClause: any = { isActive: true };

                if (filter) {
                    if (filter.isSpecialOffer !== undefined && filter.isSpecialOffer !== null) {
                        whereClause.isSpecialOffer = filter.isSpecialOffer;
                    }

                    // Filter by isPopular
                    if (filter.isPopular !== undefined && filter.isPopular !== null) {
                        whereClause.isPopular = filter.isPopular;
                    }
                }

                if (keyword && keyword.trim() !== '') {
                    const trimmedKeyword = keyword.trim();
                    const numericKeyword = parseFloat(trimmedKeyword);

                    if (!isNaN(numericKeyword)) {
                        whereClause.price = numericKeyword;
                    } else {
                        whereClause.name = Like(`%${trimmedKeyword}%`);
                    }
                }

                // Get total count for pagination
                const totalProducts = await productRepository.find({
                    where: whereClause,
                    select: ['id'] // Only select id for better performance
                });

                const total = totalProducts.length;

                // Get products with pagination
                const products = await productRepository.find({
                    where: whereClause,
                    skip: skip,
                    take: limit,
                    order: {
                        createdAt: 'DESC'
                    }
                });
                console.log('products',products)


                // Get user's wishlist
                const wishlists = await wishlistRepository.find({
                    where: {
                        userId: authUserId.id,
                    } as any,
                });
                console.log('wishlists',wishlists)


                const wishlistProductIds = new Set(
                    wishlists.map((w: Wishlists) => w.productId)
                );
                console.log('wishlistProductIds',wishlistProductIds)
                

                const productIds = products.map(p => p.id);

                const productViews = await productViewRepository.find({
                    where: {
                        productId: In(productIds),
                    }
                })
                console.log('productViews',productViews)
                

                const productViewMap = productViews.reduce((acc, view) => {
                    const key = view.productId;

                    if (!acc[key]) {
                        acc[key] = [];
                    }

                    acc[key].push(view);
                    return acc;
                }, {} as Record<string, any[]>);
                console.log('productviews',productViewMap)

                // Map products with favorite status 
                const data = products.map(product => ({
                    ...product,
                    isFavorite: wishlistProductIds.has(product.id),
                    productViews: productViewMap[product.id] ?? [],
                }));

                return {
                    status: true,
                    message: msg.FOUND_PRODUCTS,
                    data,
                    total,
                    tag: "PRODUCTS_FETCHED",
                };
            } catch (error) {
                console.error(error);
                return {
                    status: false,
                    message: msg.FAILED,
                    data: [],
                    total: 0,
                    tag: "FETCH_PRODUCTS_ERROR",
                };
            }
        },

        product: async (_: any, { where }: any, context: any): Promise<any> => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tag: "UNAUTHORIZED" };
                }

                let product: any = null;

                if (where?.id) {
                    const productId = (where.id);
                    if (!productId || productId.trim() === '') {
                        return { status: false, message: "Invalid product ID", tag: "INVALID_ID" };
                    }
                    product = await productRepository.findOneBy({ id: productId, isActive: true });
                }
                if (!product) {
                    return { status: false, message: msg.NOT_FOUND || "Not found", tag: "NOT_FOUND" };
                }
                const wishlists = await wishlistRepository.find({
                    where: {
                        userId: authUserId.id,
                    } as any,
                });

                const wishlistProductIds = new Set(
                    wishlists.map((w: Wishlists) => w.productId)
                );

                return {
                    status: true,
                    message: msg.SUCCESS || "Product found",
                    tag: "PRODUCT_FOUND",
                    data: {
                        ...product,
                        isFavorite: wishlistProductIds.has(product.id),
                    },
                };
            } catch (error: any) {
                console.error("❌ Error fetching product:", error);
                return {
                    status: false,
                    message: error.message || "Failed to fetch product",
                    tag: "FETCH_PRODUCT_ERROR",
                };
            }
        }
    },

    Mutation: {
        createProduct: async (_: any, { input, images }: any, context: any): Promise<any> => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tag: "Unauthorized" };
                }

                let imageUrls: string[] = [];
                let imagePublicIds: string[] = [];

                if (images && images.length > 0) {
                    const uploadPromises = images.map(async (image: string) => {
                        const base64Data = image.split(',')[1];
                        const buffer = Buffer.from(base64Data, 'base64');

                        const result = await uploadToCloudinary({ buffer }, 'products');
                        return result;
                    });

                    const uploadResults = await Promise.all(uploadPromises);
                    imageUrls = uploadResults.map(result => result.url);
                    imagePublicIds = uploadResults.map(result => result.publicId);
                }

                const product = productRepository.create({
                    ...input,
                    imageUrl: imageUrls[0] || null,
                    imagePublicIds: imagePublicIds,
                    createdBy: authUserId,
                    isActive: true,
                });

                await productRepository.save(product);

                return {
                    status: true,
                    message: "Product created successfully",
                    tag: "PRODUCT_CREATED",
                    data: product,
                };
            } catch (error: any) {
                console.error("Error creating product:", error);
                return {
                    status: false,
                    message: error.message || "Failed to create product",
                    tag: "CREATE_PRODUCT_ERROR",
                };
            }
        },

        updateProduct: async (_: any, { id, input, images }: any, context: any): Promise<any> => {
            try {
                const authUser = requireAuth(context);
                if (!authUser?.id) {
                    return { status: false, message: "Unauthorized", tag: "UNAUTHORIZED" };
                }

                const productId = (id);
                if (!productId || productId.trim() === '') {
                    return { status: false, message: "Invalid product ID", tag: "INVALID_ID" };
                }

                const existingProduct = await productRepository.findOne({ where: { id: productId } });
                if (!existingProduct) {
                    return { status: false, message: msg.NOT_FOUND || "Product not found", tag: "NOT_FOUND" };
                }

                // Handle image uploads if new images are provided
                if (images && images.length > 0) {
                    // Delete old images from Cloudinary if they exist
                    if (existingProduct.imagePublicIds && existingProduct.imagePublicIds.length > 0) {
                        try {
                            await Promise.all(
                                existingProduct.imagePublicIds.map(publicId =>
                                    deleteFromCloudinary(publicId)
                                )
                            );
                        } catch (deleteError) {
                            console.error("Error deleting old images:", deleteError);
                            // Continue even if deletion fails
                        }
                    }

                    // Upload new images to Cloudinary
                    try {
                        const uploadPromises = images.map(async (image: any) => {
                            const { createReadStream } = await image;
                            const stream = createReadStream();

                            // Convert stream to buffer
                            const chunks: any[] = [];
                            for await (const chunk of stream) {
                                chunks.push(chunk);
                            }
                            const buffer = Buffer.concat(chunks);

                            return await uploadToCloudinary({ buffer }, 'products');
                        });

                        const uploadResults = await Promise.all(uploadPromises);

                        // Add image URL and public IDs to input
                        input.imageUrl = uploadResults[0]?.url || null;
                        input.imagePublicIds = uploadResults.map(r => r.publicId);
                    } catch (uploadError) {
                        console.error("Error uploading images:", uploadError);
                        return {
                            status: false,
                            message: "Failed to upload images",
                            tag: "IMAGE_UPLOAD_ERROR",
                        };
                    }
                }

                // Update product with new data
                await productRepository.update({ id: productId }, { ...input });

                const updatedProduct = await productRepository.findOne({ where: { id: productId } });

                return {
                    status: true,
                    message: msg.SUCCESS || "Product updated successfully",
                    tag: "PRODUCT_UPDATED",
                    data: updatedProduct,
                };
            } catch (error: any) {
                console.error("Error updating product:", error);
                return {
                    status: false,
                    message: error.message || "Failed to update product",
                    tag: "UPDATE_PRODUCT_ERROR",
                };
            }
        },
        deleteProduct: async (_: any, { id }: any, context: any): Promise<any> => {
            try {
                if (!context?.req?.headers?.authorization) {
                    return { status: false, message: msg.NO_TOKEN, tag: "Unauthorized" };
                }

                let token = context.req.headers.authorization;

                if (token.startsWith('Authorization: ')) {
                    token = token.split(' ')[1];
                }

                if (!token) {
                    return { status: false, message: msg.NO_TOKEN, tag: "Unauthorized" };
                }

                const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

                const productId = (id);
                if (!productId || productId.trim() === '') {
                    return { status: false, message: "Invalid product ID", tag: "INVALID_ID" };
                }

                const existingProduct = await productRepository.findOne({
                    where: { id: productId }
                });

                if (!existingProduct) {
                    return { status: false, message: msg.NOT_FOUND, tag: "Not Found" };
                }

                // Delete images from Cloudinary before deleting product
                if (existingProduct.imagePublicIds && existingProduct.imagePublicIds.length > 0) {
                    try {
                        await Promise.all(
                            existingProduct.imagePublicIds.map(publicId =>
                                deleteFromCloudinary(publicId)
                            )
                        );
                    } catch (deleteError) {
                        console.error("Error deleting images from Cloudinary:", deleteError);
                        // Continue with product deletion even if image deletion fails
                    }
                }

                // Delete the product from database
                await productRepository.delete({ id: productId });

                return {
                    status: true,
                    message: msg.SUCCESS || "Product deleted successfully",
                    tag: "PRODUCT_DELETED",
                    data: null
                };
            } catch (error: any) {
                console.error("Error deleting product:", error);
                return {
                    status: false,
                    message: error.message || "Failed to delete product",
                    tag: "DELETE_PRODUCT_ERROR"
                };
            }
        }
    }
}