import { AppDataSource } from "../../config/db.js";
import { SaleDetails } from "../models/saleDetail.entity.js";
import { requireAuth } from "../../requireAuth.js";

const saleDetailRepository = AppDataSource.getRepository(SaleDetails);

export const saleDetailResolver = {
  Query: {
    getSaleDetail: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const detailId = args.id;
        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid sale detail ID", tap: "INVALID_INPUT" };
        }

        const saleDetail = await saleDetailRepository.findOne({
          where: { id: detailId },
          relations: ['sale', 'product']
        });

        if (!saleDetail) {
          return { status: false, message: "Sale detail not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Sale detail found successfully",
          tap: "FOUND",
          saleDetail: saleDetail,
        };
      } catch (error: any) {
        console.error("Get sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getSaleDetails: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const saleDetails = await saleDetailRepository.find({
          relations: ['sale', 'product']
        });

        return {
          status: true,
          message: "Sale details retrieved successfully",
          tap: "FETCHED",
          saleDetails: saleDetails,
        };
      } catch (error: any) {
        console.error("Get sale details error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createSaleDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { saleId, productId, quantity, unitPrice, totalPrice } = args.input;

        const newSaleDetail = saleDetailRepository.create({
          saleId,
          productId,
          quantity,
          unitPrice,
          totalPrice,
        });

        const savedSaleDetail = await saleDetailRepository.save(newSaleDetail);

        return {
          status: true,
          message: "Sale detail created successfully",
          tap: "CREATED",
          saleDetail: savedSaleDetail,
        };
      } catch (error: any) {
        console.error("Create sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updateSaleDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid sale detail ID", tap: "INVALID_INPUT" };
        }

        const saleDetail = await saleDetailRepository.findOneBy({ id });

        if (!saleDetail) {
          return { status: false, message: "Sale detail not found", tap: "NOT_FOUND" };
        }

        Object.assign(saleDetail, data);
        const updatedSaleDetail = await saleDetailRepository.save(saleDetail);

        return {
          status: true,
          message: "Sale detail updated successfully",
          tap: "UPDATED",
          saleDetail: updatedSaleDetail,
        };
      } catch (error: any) {
        console.error("Update sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteSaleDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const detailId = args.input.id;

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid sale detail ID", tap: "INVALID_INPUT" };
        }

        const saleDetail = await saleDetailRepository.findOneBy({ id: detailId });

        if (!saleDetail) {
          return { status: false, message: "Sale detail not found", tap: "NOT_FOUND" };
        }

        await saleDetailRepository.remove(saleDetail);

        return {
          status: true,
          message: "Sale detail deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};
