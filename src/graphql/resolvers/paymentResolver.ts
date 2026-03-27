import { AppDataSource } from "../../config/db.js";
import { Payments } from "../models/payment.entity.js";

const paymentRepository = AppDataSource.getRepository(Payments);

export const paymentResolver = {
  Query: {
    getPayment: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const paymentId = (args.id);
        if (!paymentId || paymentId.trim() === '') {
          return { status: false, message: "Invalid payment ID" };
        }

        const payment = await paymentRepository.findOne({
          where: { id: paymentId },
          relations: ['sale']
        });

        if (!payment) {
          return { status: false, message: "Payment not found" };
        }

        return {
          status: true,
          message: "Payment found successfully",
          payment: payment,
        };
      } catch (error: any) {
        console.error("Get payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getPayments: async (): Promise<any> => {
      try {
        const payments = await paymentRepository.find({
          relations: ['sale']
        });

        return {
          status: true,
          message: "Payments retrieved successfully",
          payments: payments,
        };
      } catch (error: any) {
        console.error("Get payments error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createPayment: async (_: any, args: { input: any }): Promise<any> => {
      try {
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
          payment: savedPayment,
        };
      } catch (error: any) {
        console.error("Create payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updatePayment: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const paymentId = (id);

        if (!paymentId || paymentId.trim() === '') {
          return { status: false, message: "Invalid payment ID" };
        }

        const payment = await paymentRepository.findOneBy({ id: paymentId });

        if (!payment) {
          return { status: false, message: "Payment not found" };
        }

        Object.assign(payment, data);
        const updatedPayment = await paymentRepository.save(payment);

        return {
          status: true,
          message: "Payment updated successfully",
          payment: updatedPayment,
        };
      } catch (error: any) {
        console.error("Update payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deletePayment: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const paymentId = (args.input.id);

        if (!paymentId || paymentId.trim() === '') {
          return { status: false, message: "Invalid payment ID" };
        }

        const payment = await paymentRepository.findOneBy({ id: paymentId });

        if (!payment) {
          return { status: false, message: "Payment not found" };
        }

        await paymentRepository.remove(payment);

        return {
          status: true,
          message: "Payment deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete payment error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};