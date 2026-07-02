import { msg } from '../../constants/massages.js';
import { requireAuth } from '../../requireAuth.js';
import { AppDataSource } from '../../config/db.js';
import { Products } from '../models/product.entity.js';
import { Wishlists } from '../models/wishList.entity.js';
import { Customers } from '../models/customer.entity.js';
import { ProductViews } from '../models/productView.entity.js';

const wishlistRepository = AppDataSource.getRepository(Wishlists);
const productRepository = AppDataSource.getRepository(Products);
const customerRepository = AppDataSource.getRepository(Customers);
const productViewRepository = AppDataSource.getRepository(ProductViews);

export const wishlistResolver = {
    Query: {
        wishlists: async (_: any, __: any, context: any): Promise<any> => {
            console.log("Fetching wishlists for user...");
            try {
                const current = requireAuth(context);

                const customer = await customerRepository.findOneBy({
                    id: current.id
                });

                if (!customer) {
                    return {
                        status: false,
                        message: msg.NOT_FOUND,
                        tap: "NOT_FOUND",
                        data: []
                    };
                }

                const wishlists = await wishlistRepository.find({
                    where: { customerId: customer.id },
                    relations: [
                        'product',
                        'product.unit',
                        'product.category',
                        'product.creator',
                        'product.productViews',
                        'product.productReviews',
                    ],
                    order: { createdAt: 'DESC' },
                });

                const result = wishlists.map((w) => ({
                    id: w.id,
                    customerId: w.customerId,
                    productId: w.productId,
                    createdAt: w.createdAt,
                    product: w.product ? {
                        ...w.product,
                        owner: w.product.creator ? {
                            id: w.product.creator.id,
                            firstName: w.product.creator.firstName,
                            lastName: w.product.creator.lastName,
                            shopName: w.product.creator.shopName,
                            profileImageUrl: w.product.creator.profileImageUrl,
                            bankAccountImageUrl: w.product.creator.bankAccountImageUrl,
                        } : null,
                        isFavorite: true,
                    } : null,
                }));

                return {
                    status: true,
                    message: msg.SUCCESS,
                    tap: "FETCHED",
                    total: wishlists.length.toString(),
                    data: result
                };
            } catch (error: any) {
                console.error("Wishlists error:", error);
                return {
                    status: false,
                    message: error.message,
                    tap: "ERROR",
                    data: []
                };
            }
        }
    },

    Mutation: {
        toggleWishlist: async (
            _: any,
            { productId }: { productId: string },
            context: any
        ): Promise<any> => {
            try {
                const current = requireAuth(context);
                const customer = await customerRepository.findOneBy({ id: current.id });
                if (!customer) {
                    return {
                        status: false,
                        message: msg.NOT_FOUND,
                        tap: "NOT_FOUND",
                        data: null,
                    };
                }

                const prodId = productId;
                if (!prodId || prodId.trim() === '') {
                    return {
                        status: false,
                        message: "Invalid product ID",
                        tap: "INVALID_INPUT",
                        data: null,
                    };
                }

                const product = await productRepository.findOneBy({ id: prodId });
                if (!product) {
                    return {
                        status: false,
                        message: msg.NOT_FOUND,
                        tap: "NOT_FOUND",
                        data: null,
                    };
                }

                const existingWishlist = await wishlistRepository.findOne({
                    where: {
                        customerId: customer.id,
                        productId: prodId,
                    }
                });

                if (existingWishlist) {
                    // Capture the fields BEFORE removing. TypeORM's remove()
                    // mutates the entity and clears its `id`, which would make
                    // the non-nullable `iswhislist.id` field null and crash the
                    // GraphQL response.
                    const removed = {
                        id: existingWishlist.id,
                        customerId: existingWishlist.customerId,
                        productId: existingWishlist.productId,
                    };

                    await wishlistRepository.remove(existingWishlist);

                    return {
                        status: true,
                        message: msg.WISHLIST_REMOVED,
                        tap: "WISHLIST_REMOVED",
                        data: {
                            id: removed.id,
                            customerId: removed.customerId,
                            productId: removed.productId,
                            isFavorite: false,
                        },
                    };
                }

                const newWishlist = wishlistRepository.create({
                    customerId: customer.id,
                    productId: prodId,
                });

                const saved = await wishlistRepository.save(newWishlist);

                // Adding to wishlist also counts as a view signal on the product.
                productRepository
                    .increment({ id: prodId }, 'viewsCount', 1)
                    .catch((e) => console.error('viewsCount increment failed:', e));

                // Log a ProductView row tied to this customer (best-effort).
                try {
                    const view = productViewRepository.create({
                        productId: prodId,
                        customerId: customer.id,
                        source: 'wishlist',
                    });
                    await productViewRepository.save(view);
                } catch (e) {
                    console.error('ProductView insert (wishlist) failed:', e);
                }

                return {
                    status: true,
                    message: msg.WISHLIST_ADDED,
                    tap: "WISHLIST_ADDED",
                    data: {
                        id: saved.id,
                        customerId: saved.customerId,
                        productId: saved.productId,
                        isFavorite: true,
                    },
                };

            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tap: "ERROR",
                    data: null,
                };
            }
        }
    },
};
