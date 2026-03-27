import { AppDataSource } from "../../config/db.js";
import { PurchaseOrders } from "../models/purchaseOrder.entity.js";

const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrders);

export const purchaseOrderResolver = {
  Query: {
    getPurchaseOrder: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const orderId = (args.id);
        if (!orderId || orderId.trim() === '') {
          return { status: false, message: "Invalid purchase order ID" };
        }

        const purchaseOrder = await purchaseOrderRepository.findOne({
          where: { id: orderId },
          relations: ['supplier', 'user', 'purchaseOrderDetails', 'stockReceptions']
        });

        if (!purchaseOrder) {
          return { status: false, message: "Purchase order not found" };
        }

        return {
          status: true,
          message: "Purchase order found successfully",
          purchaseOrder: purchaseOrder,
        };
      } catch (error: any) {
        console.error("Get purchase order error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getPurchaseOrders: async (): Promise<any> => {
      try {
        const purchaseOrders = await purchaseOrderRepository.find({
          relations: ['supplier', 'user', 'purchaseOrderDetails', 'stockReceptions']
        });

        return {
          status: true,
          message: "Purchase orders retrieved successfully",
          purchaseOrders: purchaseOrders,
        };
      } catch (error: any) {
        console.error("Get purchase orders error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createPurchaseOrder: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { supplierId, userId, totalPrice, status = 'pending' } = args.input;

        const newPurchaseOrder = purchaseOrderRepository.create({
          supplierId,
          userId,
          totalPrice,
          status,
        });

        const savedPurchaseOrder = await purchaseOrderRepository.save(newPurchaseOrder);

        return {
          status: true,
          message: "Purchase order created successfully",
          purchaseOrder: savedPurchaseOrder,
        };
      } catch (error: any) {
        console.error("Create purchase order error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updatePurchaseOrder: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const orderId = (id);

        if (!orderId || orderId.trim() === '') {
          return { status: false, message: "Invalid purchase order ID" };
        }

        const purchaseOrder = await purchaseOrderRepository.findOneBy({ id: orderId });

        if (!purchaseOrder) {
          return { status: false, message: "Purchase order not found" };
        }

        Object.assign(purchaseOrder, data);
        const updatedPurchaseOrder = await purchaseOrderRepository.save(purchaseOrder);

        return {
          status: true,
          message: "Purchase order updated successfully",
          purchaseOrder: updatedPurchaseOrder,
        };
      } catch (error: any) {
        console.error("Update purchase order error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deletePurchaseOrder: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const orderId = (args.input.id);

        if (!orderId || orderId.trim() === '') {
          return { status: false, message: "Invalid purchase order ID" };
        }

        const purchaseOrder = await purchaseOrderRepository.findOneBy({ id: orderId });

        if (!purchaseOrder) {
          return { status: false, message: "Purchase order not found" };
        }

        await purchaseOrderRepository.remove(purchaseOrder);

        return {
          status: true,
          message: "Purchase order deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete purchase order error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};