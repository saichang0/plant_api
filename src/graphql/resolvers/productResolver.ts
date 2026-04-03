import { requireAuth } from "@/requireAuth.js";
import { msg } from '../../constants/massages.js';
import { AppDataSource } from '../../config/db.js';
import { Products } from "../models/product.entity.js";
import { Wishlists } from "../models/wishList.entity.js";
import { uploadToCloudinary } from "@/utils/uploadImage.js";
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

                // Get user's wishlist
                const wishlists = await wishlistRepository.find({
                    where: {
                        customerId: authUserId.id,
                    } as any,
                });

                const wishlistProductIds = new Set(
                    wishlists.map((w: Wishlists) => w.productId)
                );

                const productIds = products.map(p => p.id);

                const productViews = productIds.length > 0
                    ? await productViewRepository.find({
                        where: {
                            productId: In(productIds),
                        }
                    })
                    : [];

                const productViewMap = productViews.reduce((acc, view) => {
                    const key = view.productId;

                    if (!acc[key]) {
                        acc[key] = [];
                    }

                    acc[key].push(view);
                    return acc;
                }, {} as Record<string, any[]>);

                // Map products with favorite status
                const data = products.map(product => ({
                    ...product,
                    isFavorite: wishlistProductIds.has(product.id),
                    productViews: productViewMap[product.id] ?? [],
                }));

                return {
                    status: true,
                    message: msg.FOUND_PRODUCTS,
                    tap: "FETCHED",
                    data,
                    total,
                };
            } catch (error: any) {
                console.error("Products query error:", error.message);
                console.error("Stack:", error.stack);
                return {
                    status: false,
                    message: error.message || msg.FAILED,
                    tap: "ERROR",
                    data: [],
                    total: 0,
                };
            }
        },

        product: async (_: any, { where }: any, context: any): Promise<any> => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
                }

                let product: any = null;

                if (where?.id) {
                    const productId = (where.id);
                    if (!productId || productId.trim() === '') {
                        return { status: false, message: "Invalid product ID", tap: "INVALID_INPUT" };
                    }
                    product = await productRepository.findOneBy({ id: productId, isActive: true });
                }
                if (!product) {
                    return { status: false, message: msg.NOT_FOUND || "Not found", tap: "NOT_FOUND" };
                }
                const wishlists = await wishlistRepository.find({
                    where: {
                        customerId: authUserId.id,
                    } as any,
                });

                const wishlistProductIds = new Set(
                    wishlists.map((w: Wishlists) => w.productId)
                );

                return {
                    status: true,
                    message: msg.SUCCESS || "Product found",
                    tap: "FOUND",
                    data: {
                        ...product,
                        isFavorite: wishlistProductIds.has(product.id),
                    },
                };
            } catch (error: any) {
                console.error("Error fetching product:", error);
                return {
                    status: false,
                    message: error.message || "Failed to fetch product",
                    tap: "ERROR",
                };
            }
        }
    },

    Mutation: {
        createProduct: async (_: any, { input, images }: any, context: any): Promise<any> => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
                }

                let imageUrls: string[] = [];

                if (images && images.length > 0) {
                    const uploadPromises = images.map(async (image: string) => {
                        const base64Data = image.split(',')[1];
                        const buffer = Buffer.from(base64Data, 'base64');
                        const result = await uploadToCloudinary({ buffer }, 'products');
                        return result.url;
                    });
                    imageUrls = await Promise.all(uploadPromises);
                }

                const product = productRepository.create({
                    ...input,
                    imageUrl: imageUrls[0] || input.imageUrl || null,
                    isActive: true,
                    createdBy: authUserId.id,
                });

                const savedResult = await productRepository.save(product);
                const savedProduct = Array.isArray(savedResult) ? savedResult[0] : savedResult;

                return {
                    status: true,
                    message: msg.CREATE_PRODUCT_SUCCESS,
                    tap: "CREATED",
                    data: savedProduct,
                };
            } catch (error: any) {
                console.error("Error creating product:", error);
                return {
                    status: false,
                    message: error.message || msg.ERROR_CREATING_PRODUCT,
                    tap: "ERROR",
                };
            }
        },

        updateProduct: async (_: any, { id, input, images }: any, context: any): Promise<any> => {
            try {
                const authUser = requireAuth(context);
                if (!authUser?.id) {
                    return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
                }

                const productId = (id);
                if (!productId || productId.trim() === '') {
                    return { status: false, message: "Invalid product ID", tap: "INVALID_INPUT" };
                }

                const existingProduct = await productRepository.findOne({ where: { id: productId } });
                if (!existingProduct) {
                    return { status: false, message: msg.NOT_FOUND || "Product not found", tap: "NOT_FOUND" };
                }

                // Handle image uploads if new images are provided
                if (images && images.length > 0) {
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

                            const result = await uploadToCloudinary({ buffer }, 'products');
                            return result.url;
                        });

                        const imageUrls = await Promise.all(uploadPromises);

                        // Add image URL to input (only the first image is used)
                        input.imageUrl = imageUrls[0] || null;
                    } catch (uploadError) {
                        console.error("Error uploading images:", uploadError);
                        return {
                            status: false,
                            message: "Failed to upload images",
                            tap: "ERROR",
                        };
                    }
                }

                // Update product with new data
                await productRepository.update({ id: productId }, { ...input });

                const updatedProduct = await productRepository.findOne({ where: { id: productId } });

                return {
                    status: true,
                    message: msg.SUCCESS || "Product updated successfully",
                    tap: "UPDATED",
                    data: updatedProduct,
                };
            } catch (error: any) {
                console.error("Error updating product:", error);
                return {
                    status: false,
                    message: error.message || "Failed to update product",
                    tap: "ERROR",
                };
            }
        },
        deleteProduct: async (_: any, { id }: any, context: any): Promise<any> => {
            try {
                const authUser = requireAuth(context);
                if (!authUser?.id) {
                    return { status: false, message: msg.UNAUTHORIZED, tap: "UNAUTHORIZED" };
                }

                const productId = (id);
                if (!productId || productId.trim() === '') {
                    return { status: false, message: "Invalid product ID", tap: "INVALID_INPUT" };
                }

                const existingProduct = await productRepository.findOne({
                    where: { id: productId }
                });

                if (!existingProduct) {
                    return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND" };
                }
                // Soft delete: set deletedBy and use softDelete
                await productRepository.update(productId, { deletedBy: authUser.id });
                await productRepository.softDelete(productId);

                return {
                    status: true,
                    message: msg.SUCCESS || "Product deleted successfully",
                    tap: "DELETED",
                    data: null
                };
            } catch (error: any) {
                console.error("Error deleting product:", error);
                return {
                    status: false,
                    message: error.message || "Failed to delete product",
                    tap: "ERROR",
                };
            }
        }
    }
}
