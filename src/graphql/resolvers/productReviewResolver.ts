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
                    return { status: false, message: "Unauthorized", tag: "UNAUTHORIZED" };
                }

                const review = await productReviewsRepository.findOne({
                    where: { id }
                });

                if (!review) {
                    return { status: false, message: "Review not found", tag: "NOT_FOUND" };
                }

                return {
                    status: true,
                    message: "Review found",
                    data: review,
                    tag: "REVIEW_FOUND"
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tag: "ERROR",
                };
            }
        },

        productReviews: async (_: any, { productId }: any, context: any) => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tag: "UNAUTHORIZED" };
                }

                const reviews = await productReviewsRepository.find({
                    where: { productId }
                });

                return {
                    status: true,
                    message: "Reviews found",
                    data: reviews,
                    total: reviews.length,
                    tag: "REVIEWS_FOUND"
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tag: "ERROR",
                };
            }
        }
    },
    Mutation: {
        createReview: async (_: any, { input }: any, context: any) => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tag: "Unauthorized" };
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
                        tap: "NO SALE",
                        status: false,
                        message: msg.FOUND_ORDER,
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
                        tap: "no product",
                        status: false,
                        message: msg.PRODUCT_NOT_FOUND,
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
                        tap: "Review updated successfully",
                        status: true,
                        message: msg.SUCCESS,
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
                    tap: "SUCCESS CREATE YOUR RAT",
                    status: true,
                    message: msg.SUCCESS,
                    data: review,
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tag: "Failed to fetch Order Items",
                    data: null,
                };
            }
        },

        updateProductReview: async (_: any, { id, input }: any, context: any) => {
            try {
                const authUserId = requireAuth(context);
                if (!authUserId) {
                    return { status: false, message: "Unauthorized", tag: "UNAUTHORIZED" };
                }

                const review = await productReviewsRepository.findOne({
                    where: { id }
                });

                if (!review) {
                    return { status: false, message: "Review not found", tag: "NOT_FOUND" };
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
                    data: review,
                    tag: "REVIEW_UPDATED"
                };
            } catch (error: any) {
                return {
                    status: false,
                    message: error.message,
                    tag: "ERROR",
                };
            }
        }
    }
}