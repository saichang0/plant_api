import { AppDataSource } from "../../config/db.js";
import { Sale } from "../models/sale.entity.js";
import { requireAuth } from "../../requireAuth.js";

const saleRepository = AppDataSource.getRepository(Sale);

export const saleResolver = {
  Query: {
    getSale: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const saleId = args.id;
        if (!saleId || saleId.trim() === '') {
          return { status: false, message: "Invalid sale ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOne({
          where: { id: saleId },
          relations: ['customer', 'user', 'saleDetails', 'payments', 'deliveries', 'productReviews']
        });

        if (!sale) {
          return { status: false, message: "Sale not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Sale found successfully",
          tap: "FOUND",
          sale: sale,
        };
      } catch (error: any) {
        console.error("Get sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getSales: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const sales = await saleRepository.find({
          relations: ['customer', 'user', 'saleDetails', 'payments', 'deliveries', 'productReviews']
        });

        return {
          status: true,
          message: "Sales retrieved successfully",
          tap: "FETCHED",
          sales: sales,
        };
      } catch (error: any) {
        console.error("Get sales error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createSale: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { customerId, userId, totalAmount, status = 'pending' } = args.input;

        const newSale = saleRepository.create({
          customerId,
          userId,
          totalAmount,
          status,
        });

        const savedSale = await saleRepository.save(newSale);

        return {
          status: true,
          message: "Sale created successfully",
          tap: "CREATED",
          sale: savedSale,
        };
      } catch (error: any) {
        console.error("Create sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updateSale: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid sale ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOneBy({ id });

        if (!sale) {
          return { status: false, message: "Sale not found", tap: "NOT_FOUND" };
        }

        Object.assign(sale, data);
        const updatedSale = await saleRepository.save(sale);

        return {
          status: true,
          message: "Sale updated successfully",
          tap: "UPDATED",
          sale: updatedSale,
        };
      } catch (error: any) {
        console.error("Update sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteSale: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const saleId = args.input.id;

        if (!saleId || saleId.trim() === '') {
          return { status: false, message: "Invalid sale ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOneBy({ id: saleId });

        if (!sale) {
          return { status: false, message: "Sale not found", tap: "NOT_FOUND" };
        }

        await saleRepository.remove(sale);

        return {
          status: true,
          message: "Sale deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};
