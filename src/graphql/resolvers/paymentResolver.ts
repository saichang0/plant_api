import { AppDataSource } from "../../config/db.js";
import { Payments } from "../models/payment.entity.js";
import { requireAuth } from "../../requireAuth.js";

const paymentRepository = AppDataSource.getRepository(Payments);

export const paymentResolver = {
  Query: {
    getPayment: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const paymentId = args.id;
        if (!paymentId || paymentId.trim() === '') {
          return { status: false, message: "Invalid payment ID", tap: "INVALID_INPUT" };
        }

        const payment = await paymentRepository.findOne({
          where: { id: paymentId },
          relations: ['sale']
        });

        if (!payment) {
          return { status: false, message: "Payment not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Payment found successfully",
          tap: "FOUND",
          payment: payment,
        };
      } catch (error: any) {
        console.error("Get payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getPayments: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const payments = await paymentRepository.find({
          relations: ['sale']
        });

        return {
          status: true,
          message: "Payments retrieved successfully",
          tap: "FETCHED",
          payments: payments,
        };
      } catch (error: any) {
        console.error("Get payments error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createPayment: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { saleId, paymentMethod, currency = 'KIP', amount, slipImageUrl } = args.input;

        const newPayment = paymentRepository.create({
          saleId,
          paymentMethod,
          currency,
          amount,
          slipImageUrl,
        });

        const savedPayment = await paymentRepository.save(newPayment);

        return {
          status: true,
          message: "Payment created successfully",
          tap: "CREATED",
          payment: savedPayment,
        };
      } catch (error: any) {
        console.error("Create payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updatePayment: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid payment ID", tap: "INVALID_INPUT" };
        }

        const payment = await paymentRepository.findOneBy({ id });

        if (!payment) {
          return { status: false, message: "Payment not found", tap: "NOT_FOUND" };
        }

        Object.assign(payment, data);
        const updatedPayment = await paymentRepository.save(payment);

        return {
          status: true,
          message: "Payment updated successfully",
          tap: "UPDATED",
          payment: updatedPayment,
        };
      } catch (error: any) {
        console.error("Update payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deletePayment: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const paymentId = args.input.id;

        if (!paymentId || paymentId.trim() === '') {
          return { status: false, message: "Invalid payment ID", tap: "INVALID_INPUT" };
        }

        const payment = await paymentRepository.findOneBy({ id: paymentId });

        if (!payment) {
          return { status: false, message: "Payment not found", tap: "NOT_FOUND" };
        }

        await paymentRepository.remove(payment);

        return {
          status: true,
          message: "Payment deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};
