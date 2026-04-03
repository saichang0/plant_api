import { requireAuth } from "@/requireAuth.js";
import { AppDataSource } from '@/config/db.js';
import { ProductReviews } from '../models/productReview.entity.js'
import { msg } from "@/constants/massages.js";
import { Products } from "../models/product.entity.js";
import { Sale } from "../models/sale.entity.js";

const saleRepository = AppDataSource.getRepository(Sale)
const productRepository = AppDataSource.getRepository(Products)
const productReviewsRepository = AppDataSource.getRepository(ProductReviews);

export const ProductReviewResolver = {
    Query: {
        productReview: async (_: any, { id }: any, context: any) => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
                }

                const review = await productReviewsRepository.findOne({
                    where: { id }
                });

                if (!review) {
                    return { status: false, message: "Review not found", tap: "NOT_FOUND" };
                }

                return {
                    status: true,
                    message: "Review found",
                    tap: "FOUND",
                    data: review,
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tap: "ERROR",
                };
            }
        },

        productReviews: async (_: any, { productId }: any, context: any) => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
                }

                const reviews = await productReviewsRepository.find({
                    where: { productId }
                });

                return {
                    status: true,
                    message: "Reviews found",
                    tap: "FETCHED",
                    data: reviews,
                    total: reviews.length,
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tap: "ERROR",
                };
            }
        }
    },
    Mutation: {
        createReview: async (_: any, { input }: any, context: any) => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
                }

                const userId = authUserId.id;
                const productId = input.productId;
                const saleId = input.saleId;

                const saleDoc = await saleRepository.findOne({
                    where: {
                        id: saleId,
                        userId,
                    },
                });

                if (!saleDoc) {
                    return {
                        status: false,
                        message: msg.FOUND_ORDER,
                        tap: "NOT_FOUND",
                        data: null,
                    };
                }

                const product = await productRepository.findOne({
                    where: {
                        id: productId
                    }
                })

                if (!product) {
                    return {
                        status: false,
                        message: msg.PRODUCT_NOT_FOUND,
                        tap: "NOT_FOUND",
                        data: null,
                    };
                }

                const existingReview = await productReviewsRepository.findOne({
                    where: {
                        productId,
                        customerId: saleDoc.customerId,
                        saleId,
                    },
                });

                if (existingReview) {
                    if (input.rating !== undefined) {
                        existingReview.rating = input.rating;
                    }

                    if (input.comment !== undefined) {
                        existingReview.comment = input.comment;
                    }

                    existingReview.updatedAt = new Date();

                    await productReviewsRepository.save(existingReview);

                    return {
                        status: true,
                        message: msg.SUCCESS,
                        tap: "UPDATED",
                        data: existingReview,
                    };
                }

                const review = productReviewsRepository.create({
                    productId,
                    customerId: saleDoc.customerId,
                    saleId,
                    rating: input.rating,
                    comment: input.comment,
                    isVerifiedPurchase: true,
                });

                await productReviewsRepository.save(review);

                return {
                    status: true,
                    message: msg.SUCCESS,
                    tap: "CREATED",
                    data: review,
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tap: "ERROR",
                    data: null,
                };
            }
        },

        updateProductReview: async (_: any, { id, input }: any, context: any) => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
                }

                const review = await productReviewsRepository.findOne({
                    where: { id }
                });

                if (!review) {
                    return { status: false, message: "Review not found", tap: "NOT_FOUND" };
                }

                if (input.rating !== undefined) {
                    review.rating = input.rating;
                }

                if (input.comment !== undefined) {
                    review.comment = input.comment;
                }

                review.updatedAt = new Date();

                await productReviewsRepository.save(review);

                return {
                    status: true,
                    message: "Review updated successfully",
                    tap: "UPDATED",
                    data: review,
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tap: "ERROR",
                };
            }
        }
    }
}
