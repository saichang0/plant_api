import { requireAuth, requireCustomer } from "@/requireAuth.js";
import { msg } from '../../constants/massages.js';
import { AppDataSource } from '../../config/db.js';
import { Products } from "../models/product.entity.js";
import { Wishlists } from "../models/wishList.entity.js";
import { uploadToCloudinary } from "@/utils/uploadImage.js";
import { ProductViews } from "../models/productView.entity.js";
import { StockMovements } from "../models/stockMovement.entity.js";
import { Like, In } from 'typeorm';

const productRepository = AppDataSource.getRepository(Products);
const wishlistRepository = AppDataSource.getRepository(Wishlists);
const productViewRepository = AppDataSource.getRepository(ProductViews);
const stockMovementRepository = AppDataSource.getRepository(StockMovements);

export const productResolver = {
    Query: {
        products: async (_: any, args: any, context: any) => {
            try {
                const authUserId = requireAuth(context);

                const { keyword, filter, paginate } = args;
                const page = paginate?.page || 1;
                const limit = paginate?.limit || 50;
                const skip = (page - 1) * limit;

                let whereClause: any = { isActive: true, createdBy: authUserId.id };

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
                    relations: ['unit', 'category'],
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
                    product = await productRepository.findOne({
                        where: { id: productId, isActive: true, createdBy: authUserId.id },
                        relations: ['unit', 'category'],
                    });
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
        },

        // ─── Customer-facing: browse ALL shops' products ───────────────
        publicProducts: async (_: any, args: any, context: any) => {
            try {
                const authCustomer = requireCustomer(context);

                const { keyword, filter, paginate, shopId } = args;
                const page = paginate?.page || 1;
                const limit = paginate?.limit || 50;
                const skip = (page - 1) * limit;

                const whereClause: any = { isActive: true };
                if (shopId) whereClause.createdBy = shopId;

                if (filter) {
                    if (filter.isSpecialOffer !== undefined && filter.isSpecialOffer !== null) {
                        whereClause.isSpecialOffer = filter.isSpecialOffer;
                    }
                    if (filter.isPopular !== undefined && filter.isPopular !== null) {
                        whereClause.isPopular = filter.isPopular;
                    }
                }

                if (keyword && keyword.trim() !== '') {
                    whereClause.name = Like(`%${keyword.trim()}%`);
                }

                const [products, total] = await productRepository.findAndCount({
                    where: whereClause,
                    relations: ['unit', 'category', 'creator', 'productViews', 'productReviews'],
                    skip,
                    take: limit,
                    order: { createdAt: 'DESC' },
                });

                // Customer's wishlist
                const wishlists = await wishlistRepository.find({
                    where: { customerId: authCustomer.id } as any,
                });
                const wishlistProductIds = new Set(wishlists.map(w => w.productId));

                const data = products.map(p => ({
                    ...p,
                    owner: p.creator ? {
                        id: p.creator.id,
                        firstName: p.creator.firstName,
                        lastName: p.creator.lastName,
                        shopName: p.creator.shopName,
                        profileImageUrl: p.creator.profileImageUrl,
                        bankAccountImageUrl: p.creator.bankAccountImageUrl,
                    } : null,
                    isFavorite: wishlistProductIds.has(p.id),
                    productViews: p.productViews ?? [],
                    productReviews: p.productReviews ?? [],
                }));

                return {
                    status: true,
                    message: "Products fetched",
                    tap: "FETCHED",
                    data,
                    total,
                };
            } catch (error: any) {
                console.error("publicProducts error:", error.message);
                return { status: false, message: error.message || "Failed", tap: "ERROR", data: [], total: 0 };
            }
        },

        publicProduct: async (_: any, { id }: any, context: any): Promise<any> => {
            try {
                const authCustomer = requireCustomer(context);

                if (!id || id.trim() === '') {
                    return { status: false, message: "Invalid product ID", tap: "INVALID_INPUT" };
                }

                const product = await productRepository.findOne({
                    where: { id, isActive: true },
                    relations: ['unit', 'category', 'creator', 'productViews', 'productReviews'],
                });

                if (!product) {
                    return { status: false, message: msg.NOT_FOUND || "Not found", tap: "NOT_FOUND" };
                }

                // Bump views counter on detail open. Best-effort, never blocks the response.
                productRepository
                    .increment({ id: product.id }, 'viewsCount', 1)
                    .catch((e) => console.error('viewsCount increment failed:', e));
                product.viewsCount = (product.viewsCount ?? 0) + 1;

                // Log a ProductView row tied to this customer (best-effort).
                try {
                    const view = productViewRepository.create({
                        productId: product.id,
                        customerId: authCustomer.id,
                        source: 'detail',
                    });
                    const savedView = await productViewRepository.save(view);
                    product.productViews = [...(product.productViews ?? []), savedView];
                } catch (e) {
                    console.error('ProductView insert (detail) failed:', e);
                }

                const wishlist = await wishlistRepository.findOne({
                    where: { customerId: authCustomer.id, productId: product.id } as any,
                });

                return {
                    status: true,
                    message: "Product found",
                    tap: "FOUND",
                    data: {
                        ...product,
                        owner: product.creator ? {
                            id: product.creator.id,
                            firstName: product.creator.firstName,
                            lastName: product.creator.lastName,
                            shopName: product.creator.shopName,
                            profileImageUrl: product.creator.profileImageUrl,
                            bankAccountImageUrl: product.creator.bankAccountImageUrl,
                        } : null,
                        isFavorite: !!wishlist,
                        productViews: product.productViews ?? [],
                        productReviews: product.productReviews ?? [],
                    },
                };
            } catch (error: any) {
                console.error("publicProduct error:", error);
                return { status: false, message: error.message || "Failed", tap: "ERROR" };
            }
        },
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
                    isPopular: input.isSpecialOffer === true ? false : true,
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

                const existingProduct = await productRepository.findOne({ where: { id: productId, createdBy: authUser.id } });
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

                const stockBefore = existingProduct.stockQuantity;

                // Update product with new data
                await productRepository.update({ id: productId }, { ...input });

                const updatedProduct = await productRepository.findOne({ where: { id: productId } });

                // Audit: if the manual edit changed the stock count, log it.
                if (updatedProduct && updatedProduct.stockQuantity !== stockBefore) {
                    try {
                        const movement = stockMovementRepository.create({
                            productId: updatedProduct.id,
                            userId: authUser.id,
                            change: updatedProduct.stockQuantity - stockBefore,
                            quantityBefore: stockBefore,
                            quantityAfter: updatedProduct.stockQuantity,
                            reason: 'manual_edit',
                            referenceId: updatedProduct.id,
                            referenceType: 'product',
                            note: `Manual edit via updateProduct`,
                        });
                        await stockMovementRepository.save(movement);
                    } catch (e) {
                        console.error('stock movement log (manual_edit) failed:', e);
                    }
                }

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
                    where: { id: productId, createdBy: authUser.id }
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
