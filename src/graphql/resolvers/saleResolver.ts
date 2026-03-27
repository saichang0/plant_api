import { AppDataSource } from "../../config/db.js";
import { Sale } from "../models/sale.entity.js";

const saleRepository = AppDataSource.getRepository(Sale);

export const saleResolver = {
  Query: {
    getSale: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const saleId = (args.id);
        if (!saleId || saleId.trim() === '') {
          return { status: false, message: "Invalid sale ID" };
        }

        const sale = await saleRepository.findOne({
          where: { id: saleId },
          relations: ['customer', 'user', 'saleDetails', 'payments', 'deliveries', 'productReviews']
        });

        if (!sale) {
          return { status: false, message: "Sale not found" };
        }

        return {
          status: true,
          message: "Sale found successfully",
          sale: sale,
        };
      } catch (error: any) {
        console.error("Get sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getSales: async (): Promise<any> => {
      try {
        const sales = await saleRepository.find({
          relations: ['customer', 'user', 'saleDetails', 'payments', 'deliveries', 'productReviews']
        });

        return {
          status: true,
          message: "Sales retrieved successfully",
          sales: sales,
        };
      } catch (error: any) {
        console.error("Get sales error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createSale: async (_: any, args: { input: any }): Promise<any> => {
      try {
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
          sale: savedSale,
        };
      } catch (error: any) {
        console.error("Create sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateSale: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const saleId = (id);

        if (!saleId || saleId.trim() === '') {
          return { status: false, message: "Invalid sale ID" };
        }

        const sale = await saleRepository.findOneBy({ id: saleId });

        if (!sale) {
          return { status: false, message: "Sale not found" };
        }

        Object.assign(sale, data);
        const updatedSale = await saleRepository.save(sale);

        return {
          status: true,
          message: "Sale updated successfully",
          sale: updatedSale,
        };
      } catch (error: any) {
        console.error("Update sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteSale: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const saleId = (args.input.id);

        if (!saleId || saleId.trim() === '') {
          return { status: false, message: "Invalid sale ID" };
        }

        const sale = await saleRepository.findOneBy({ id: saleId });

        if (!sale) {
          return { status: false, message: "Sale not found" };
        }

        await saleRepository.remove(sale);

        return {
          status: true,
          message: "Sale deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};