import { AppDataSource } from "../../config/db.js";
import { StockReceptionDetails } from "../models/stockReceptionDetail.entity.js";

const stockReceptionDetailRepository = AppDataSource.getRepository(StockReceptionDetails);

export const stockReceptionDetailResolver = {
  Query: {
    getStockReceptionDetail: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const detailId = (args.id);
        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid stock reception detail ID" };
        }

        const stockReceptionDetail = await stockReceptionDetailRepository.findOne({
          where: { id: detailId },
          relations: ['reception', 'product']
        });

        if (!stockReceptionDetail) {
          return { status: false, message: "Stock reception detail not found" };
        }

        return {
          status: true,
          message: "Stock reception detail found successfully",
          stockReceptionDetail: stockReceptionDetail,
        };
      } catch (error: any) {
        console.error("Get stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getStockReceptionDetails: async (): Promise<any> => {
      try {
        const stockReceptionDetails = await stockReceptionDetailRepository.find({
          relations: ['reception', 'product']
        });

        return {
          status: true,
          message: "Stock reception details retrieved successfully",
          stockReceptionDetails: stockReceptionDetails,
        };
      } catch (error: any) {
        console.error("Get stock reception details error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createStockReceptionDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
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
          stockReceptionDetail: savedStockReceptionDetail,
        };
      } catch (error: any) {
        console.error("Create stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateStockReceptionDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const detailId = (id);

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid stock reception detail ID" };
        }

        const stockReceptionDetail = await stockReceptionDetailRepository.findOneBy({ id: detailId });

        if (!stockReceptionDetail) {
          return { status: false, message: "Stock reception detail not found" };
        }

        Object.assign(stockReceptionDetail, data);
        const updatedStockReceptionDetail = await stockReceptionDetailRepository.save(stockReceptionDetail);

        return {
          status: true,
          message: "Stock reception detail updated successfully",
          stockReceptionDetail: updatedStockReceptionDetail,
        };
      } catch (error: any) {
        console.error("Update stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteStockReceptionDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const detailId = (args.input.id);

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid stock reception detail ID" };
        }

        const stockReceptionDetail = await stockReceptionDetailRepository.findOneBy({ id: detailId });

        if (!stockReceptionDetail) {
          return { status: false, message: "Stock reception detail not found" };
        }

        await stockReceptionDetailRepository.remove(stockReceptionDetail);

        return {
          status: true,
          message: "Stock reception detail deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete stock reception detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};