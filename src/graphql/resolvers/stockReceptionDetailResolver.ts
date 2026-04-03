import { AppDataSource } from "../../config/db.js";
import { StockReceptionDetails } from "../models/stockReceptionDetail.entity.js";
import { requireAuth } from "../../requireAuth.js";

const stockReceptionDetailRepository = AppDataSource.getRepository(StockReceptionDetails);

export const stockReceptionDetailResolver = {
  Query: {
    getStockReceptionDetail: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const detailId = args.id;
        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid stock reception detail ID", tap: "INVALID_INPUT" };
        }

        const stockReceptionDetail = await stockReceptionDetailRepository.findOne({
          where: { id: detailId },
          relations: ['reception', 'product']
        });

        if (!stockReceptionDetail) {
          return { status: false, message: "Stock reception detail not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Stock reception detail found successfully",
          tap: "FOUND",
          stockReceptionDetail: stockReceptionDetail,
        };
      } catch (error: any) {
        console.error("Get stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getStockReceptionDetails: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const stockReceptionDetails = await stockReceptionDetailRepository.find({
          relations: ['reception', 'product']
        });

        return {
          status: true,
          message: "Stock reception details retrieved successfully",
          tap: "FETCHED",
          stockReceptionDetails: stockReceptionDetails,
        };
      } catch (error: any) {
        console.error("Get stock reception details error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createStockReceptionDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { receptionId, productId, quantityReceived, actualCostPrice, status = 'received' } = args.input;

        const newStockReceptionDetail = stockReceptionDetailRepository.create({
          receptionId,
          productId,
          quantityReceived,
          actualCostPrice,
          status,
        });

        const savedStockReceptionDetail = await stockReceptionDetailRepository.save(newStockReceptionDetail);

        return {
          status: true,
          message: "Stock reception detail created successfully",
          tap: "CREATED",
          stockReceptionDetail: savedStockReceptionDetail,
        };
      } catch (error: any) {
        console.error("Create stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updateStockReceptionDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid stock reception detail ID", tap: "INVALID_INPUT" };
        }

        const stockReceptionDetail = await stockReceptionDetailRepository.findOneBy({ id });

        if (!stockReceptionDetail) {
          return { status: false, message: "Stock reception detail not found", tap: "NOT_FOUND" };
        }

        Object.assign(stockReceptionDetail, data);
        const updatedStockReceptionDetail = await stockReceptionDetailRepository.save(stockReceptionDetail);

        return {
          status: true,
          message: "Stock reception detail updated successfully",
          tap: "UPDATED",
          stockReceptionDetail: updatedStockReceptionDetail,
        };
      } catch (error: any) {
        console.error("Update stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteStockReceptionDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const detailId = args.input.id;

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid stock reception detail ID", tap: "INVALID_INPUT" };
        }

        const stockReceptionDetail = await stockReceptionDetailRepository.findOneBy({ id: detailId });

        if (!stockReceptionDetail) {
          return { status: false, message: "Stock reception detail not found", tap: "NOT_FOUND" };
        }

        await stockReceptionDetailRepository.remove(stockReceptionDetail);

        return {
          status: true,
          message: "Stock reception detail deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};
