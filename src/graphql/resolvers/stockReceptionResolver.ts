import { AppDataSource } from "../../config/db.js";
import { StockReceptions } from "../models/stockReception.entity.js";

const stockReceptionRepository = AppDataSource.getRepository(StockReceptions);

export const stockReceptionResolver = {
  Query: {
    getStockReception: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const receptionId = (args.id);
        if (!receptionId || receptionId.trim() === '') {
          return { status: false, message: "Invalid stock reception ID" };
        }

        const stockReception = await stockReceptionRepository.findOne({
          where: { id: receptionId },
          relations: ['purchaseOrder', 'user', 'stockReceptionDetails']
        });

        if (!stockReception) {
          return { status: false, message: "Stock reception not found" };
        }

        return {
          status: true,
          message: "Stock reception found successfully",
          stockReception: stockReception,
        };
      } catch (error: any) {
        console.error("Get stock reception error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getStockReceptions: async (): Promise<any> => {
      try {
        const stockReceptions = await stockReceptionRepository.find({
          relations: ['purchaseOrder', 'user', 'stockReceptionDetails']
        });

        return {
          status: true,
          message: "Stock receptions retrieved successfully",
          stockReceptions: stockReceptions,
        };
      } catch (error: any) {
        console.error("Get stock receptions error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createStockReception: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { purchaseOrderId, userId, totalActualPrice } = args.input;

        const newStockReception = stockReceptionRepository.create({
          purchaseOrderId,
          userId,
          totalActualPrice,
        });

        const savedStockReception = await stockReceptionRepository.save(newStockReception);

        return {
          status: true,
          message: "Stock reception created successfully",
          stockReception: savedStockReception,
        };
      } catch (error: any) {
        console.error("Create stock reception error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateStockReception: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const receptionId = id;

        if (!receptionId || receptionId.trim() === '') {
          return { status: false, message: "Invalid stock reception ID" };
        }

        const stockReception = await stockReceptionRepository.findOneBy({ id: receptionId });

        if (!stockReception) {
          return { status: false, message: "Stock reception not found" };
        }

        Object.assign(stockReception, data);
        const updatedStockReception = await stockReceptionRepository.save(stockReception);

        return {
          status: true,
          message: "Stock reception updated successfully",
          stockReception: updatedStockReception,
        };
      } catch (error: any) {
        console.error("Update stock reception error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteStockReception: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const receptionId = args.input.id;

        if (!receptionId || receptionId.trim() === '') {
          return { status: false, message: "Invalid stock reception ID" };
        }

        const stockReception = await stockReceptionRepository.findOneBy({ id: receptionId });

        if (!stockReception) {
          return { status: false, message: "Stock reception not found" };
        }

        await stockReceptionRepository.remove(stockReception);

        return {
          status: true,
          message: "Stock reception deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete stock reception error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};