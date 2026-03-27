import { AppDataSource } from "../../config/db.js";
import { SaleDetails } from "../models/saleDetail.entity.js";

const saleDetailRepository = AppDataSource.getRepository(SaleDetails);

export const saleDetailResolver = {
  Query: {
    getSaleDetail: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const detailId = (args.id);
        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid sale detail ID" };
        }

        const saleDetail = await saleDetailRepository.findOne({
          where: { id: detailId },
          relations: ['sale', 'product']
        });

        if (!saleDetail) {
          return { status: false, message: "Sale detail not found" };
        }

        return {
          status: true,
          message: "Sale detail found successfully",
          saleDetail: saleDetail,
        };
      } catch (error: any) {
        console.error("Get sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getSaleDetails: async (): Promise<any> => {
      try {
        const saleDetails = await saleDetailRepository.find({
          relations: ['sale', 'product']
        });

        return {
          status: true,
          message: "Sale details retrieved successfully",
          saleDetails: saleDetails,
        };
      } catch (error: any) {
        console.error("Get sale details error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createSaleDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
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
          saleDetail: savedSaleDetail,
        };
      } catch (error: any) {
        console.error("Create sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateSaleDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const detailId = (id);

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid sale detail ID" };
        }

        const saleDetail = await saleDetailRepository.findOneBy({ id: detailId });

        if (!saleDetail) {
          return { status: false, message: "Sale detail not found" };
        }

        Object.assign(saleDetail, data);
        const updatedSaleDetail = await saleDetailRepository.save(saleDetail);

        return {
          status: true,
          message: "Sale detail updated successfully",
          saleDetail: updatedSaleDetail,
        };
      } catch (error: any) {
        console.error("Update sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteSaleDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const detailId = (args.input.id);

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid sale detail ID" };
        }

        const saleDetail = await saleDetailRepository.findOneBy({ id: detailId });

        if (!saleDetail) {
          return { status: false, message: "Sale detail not found" };
        }

        await saleDetailRepository.remove(saleDetail);

        return {
          status: true,
          message: "Sale detail deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete sale detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};