import { AppDataSource } from "../../config/db.js";
import { PurchaseOrderDetails } from "../models/purchaseOrderDetail.entity.js";

const purchaseOrderDetailRepository = AppDataSource.getRepository(PurchaseOrderDetails);

export const purchaseOrderDetailResolver = {
  Query: {
    getPurchaseOrderDetail: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const detailId = (args.id);
        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid purchase order detail ID" };
        }

        const purchaseOrderDetail = await purchaseOrderDetailRepository.findOne({
          where: { id: detailId },
          relations: ['order', 'product']
        });

        if (!purchaseOrderDetail) {
          return { status: false, message: "Purchase order detail not found" };
        }

        return {
          status: true,
          message: "Purchase order detail found successfully",
          purchaseOrderDetail: purchaseOrderDetail,
        };
      } catch (error: any) {
        console.error("Get purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getPurchaseOrderDetails: async (): Promise<any> => {
      try {
        const purchaseOrderDetails = await purchaseOrderDetailRepository.find({
          relations: ['order', 'product']
        });

        return {
          status: true,
          message: "Purchase order details retrieved successfully",
          purchaseOrderDetails: purchaseOrderDetails,
        };
      } catch (error: any) {
        console.error("Get purchase order details error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createPurchaseOrderDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { orderId, productId, quantity } = args.input;

        const newPurchaseOrderDetail = purchaseOrderDetailRepository.create({
          orderId,
          productId,
          quantity,
        });

        const savedPurchaseOrderDetail = await purchaseOrderDetailRepository.save(newPurchaseOrderDetail);

        return {
          status: true,
          message: "Purchase order detail created successfully",
          purchaseOrderDetail: savedPurchaseOrderDetail,
        };
      } catch (error: any) {
        console.error("Create purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updatePurchaseOrderDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const detailId = (id);

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid purchase order detail ID" };
        }

        const purchaseOrderDetail = await purchaseOrderDetailRepository.findOneBy({ id: detailId });

        if (!purchaseOrderDetail) {
          return { status: false, message: "Purchase order detail not found" };
        }

        Object.assign(purchaseOrderDetail, data);
        const updatedPurchaseOrderDetail = await purchaseOrderDetailRepository.save(purchaseOrderDetail);

        return {
          status: true,
          message: "Purchase order detail updated successfully",
          purchaseOrderDetail: updatedPurchaseOrderDetail,
        };
      } catch (error: any) {
        console.error("Update purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deletePurchaseOrderDetail: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const detailId = (args.input.id);

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid purchase order detail ID" };
        }

        const purchaseOrderDetail = await purchaseOrderDetailRepository.findOneBy({ id: detailId });

        if (!purchaseOrderDetail) {
          return { status: false, message: "Purchase order detail not found" };
        }

        await purchaseOrderDetailRepository.remove(purchaseOrderDetail);

        return {
          status: true,
          message: "Purchase order detail deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};