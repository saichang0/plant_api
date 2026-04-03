import { msg } from '../../constants/massages.js';
import { requireAuth } from '../../requireAuth.js';
import { AppDataSource } from '../../config/db.js';
import { Products } from '../models/product.entity.js';
import { Wishlists } from '../models/wishList.entity.js';
import { Customers } from '../models/customer.entity.js';

const wishlistRepository = AppDataSource.getRepository(Wishlists);
const productRepository = AppDataSource.getRepository(Products);
const customerRepository = AppDataSource.getRepository(Customers);

export const wishlistResolver = {
    Query: {
        wishlists: async (_: any, __: any, context: any): Promise<any> => {
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
                    relations: ['product']
                });

                const result = wishlists.map((w) => ({
                    id: w.id,
                    customerId: w.customerId,
                    productId: w.productId,
                    createdAt: w.createdAt,
                    product: w.product ? {
                        id: w.product.id,
                        name: w.product.name,
                        price: w.product.salePrice,
                        description: w.product.description,
                        stockQuantity: w.product.stockQuantity,
                        isPopular: w.product.isPopular,
                        isSpecialOffer: w.product.isSpecialOffer,
                        discount: w.product.discount,
                        isActive: w.product.isActive,
                    } : null
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
                    await wishlistRepository.remove(existingWishlist);

                    return {
                        status: true,
                        message: msg.WISHLIST_REMOVED,
                        tap: "WISHLIST_REMOVED",
                        data: {
                            id: existingWishlist.id,
                            customerId: existingWishlist.customerId,
                            productId: existingWishlist.productId,
                            isFavorite: false,
                        },
                    };
                }

                const newWishlist = wishlistRepository.create({
                    customerId: customer.id,
                    productId: prodId,
                });

                const saved = await wishlistRepository.save(newWishlist);

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
