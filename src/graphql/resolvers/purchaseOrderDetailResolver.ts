import { AppDataSource } from "../../config/db.js";
import { PurchaseOrderDetails } from "../models/purchaseOrderDetail.entity.js";
import { requireAuth } from "../../requireAuth.js";

const purchaseOrderDetailRepository = AppDataSource.getRepository(PurchaseOrderDetails);

export const purchaseOrderDetailResolver = {
  Query: {
    getPurchaseOrderDetail: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const detailId = args.id;
        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid purchase order detail ID", tap: "INVALID_INPUT" };
        }

        const purchaseOrderDetail = await purchaseOrderDetailRepository.findOne({
          where: { id: detailId },
          relations: ['order', 'product']
        });

        if (!purchaseOrderDetail) {
          return { status: false, message: "Purchase order detail not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Purchase order detail found successfully",
          tap: "FOUND",
          purchaseOrderDetail: purchaseOrderDetail,
        };
      } catch (error: any) {
        console.error("Get purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getPurchaseOrderDetails: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const purchaseOrderDetails = await purchaseOrderDetailRepository.find({
          relations: ['order', 'product']
        });

        return {
          status: true,
          message: "Purchase order details retrieved successfully",
          tap: "FETCHED",
          purchaseOrderDetails: purchaseOrderDetails,
        };
      } catch (error: any) {
        console.error("Get purchase order details error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createPurchaseOrderDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

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
          tap: "CREATED",
          purchaseOrderDetail: savedPurchaseOrderDetail,
        };
      } catch (error: any) {
        console.error("Create purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updatePurchaseOrderDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid purchase order detail ID", tap: "INVALID_INPUT" };
        }

        const purchaseOrderDetail = await purchaseOrderDetailRepository.findOneBy({ id });

        if (!purchaseOrderDetail) {
          return { status: false, message: "Purchase order detail not found", tap: "NOT_FOUND" };
        }

        Object.assign(purchaseOrderDetail, data);
        const updatedPurchaseOrderDetail = await purchaseOrderDetailRepository.save(purchaseOrderDetail);

        return {
          status: true,
          message: "Purchase order detail updated successfully",
          tap: "UPDATED",
          purchaseOrderDetail: updatedPurchaseOrderDetail,
        };
      } catch (error: any) {
        console.error("Update purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deletePurchaseOrderDetail: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const detailId = args.input.id;

        if (!detailId || detailId.trim() === '') {
          return { status: false, message: "Invalid purchase order detail ID", tap: "INVALID_INPUT" };
        }

        const purchaseOrderDetail = await purchaseOrderDetailRepository.findOneBy({ id: detailId });

        if (!purchaseOrderDetail) {
          return { status: false, message: "Purchase order detail not found", tap: "NOT_FOUND" };
        }

        await purchaseOrderDetailRepository.remove(purchaseOrderDetail);

        return {
          status: true,
          message: "Purchase order detail deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete purchase order detail error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};
