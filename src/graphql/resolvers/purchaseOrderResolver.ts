import { AppDataSource } from "../../config/db.js";
import { PurchaseOrders } from "../models/purchaseOrder.entity.js";
import { PurchaseOrderDetails } from "../models/purchaseOrderDetail.entity.js";
import { requireAuth } from "@/requireAuth.js";

const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrders);
const purchaseOrderDetailRepository = AppDataSource.getRepository(PurchaseOrderDetails);

export const purchaseOrderResolver = {
  Query: {
    getPurchaseOrder: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const orderId = args.id;
        if (!orderId || orderId.trim() === '') {
          return { status: false, message: "Invalid purchase order ID", tap: "INVALID_INPUT" };
        }

        const purchaseOrder = await purchaseOrderRepository.findOne({
          where: { id: orderId },
          relations: ['supplier', 'user', 'purchaseOrderDetails', 'purchaseOrderDetails.product', 'stockReceptions']
        });

        if (!purchaseOrder) {
          return { status: false, message: "Purchase order not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Purchase order found successfully",
          tap: "FOUND",
          purchaseOrder,
        };
      } catch (error: any) {
        console.error("Get purchase order error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    getPurchaseOrders: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const purchaseOrders = await purchaseOrderRepository.find({
          relations: ['supplier', 'user', 'purchaseOrderDetails', 'purchaseOrderDetails.product', 'stockReceptions'],
          order: { orderDate: 'DESC' }
        });

        return {
          status: true,
          message: "Purchase orders retrieved successfully",
          tap: "FETCHED",
          purchaseOrders,
        };
      } catch (error: any) {
        console.error("Get purchase orders error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },

  Mutation: {
    createPurchaseOrder: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        const authUser = requireAuth(context);
        const { supplierId, items } = args.input;

        if (!items || items.length === 0) {
          return { status: false, message: "At least one item is required", tap: "INVALID_INPUT" };
        }

        // Calculate total price from items
        const totalPrice = items.reduce((sum: number, item: any) => sum + (item.costPrice * item.quantity), 0);

        // Create purchase order + details in a transaction
        const result = await AppDataSource.transaction(async (manager) => {
          const newPurchaseOrder = manager.create(PurchaseOrders, {
            supplierId,
            userId: authUser.id,
            totalPrice,
            status: 'pending',
          });
          const savedOrder = await manager.save(PurchaseOrders, newPurchaseOrder);

          const details = items.map((item: any) =>
            manager.create(PurchaseOrderDetails, {
              orderId: savedOrder.id,
              productId: item.productId,
              quantity: item.quantity,
            })
          );
          await manager.save(PurchaseOrderDetails, details);

          // Return with relations loaded
          return manager.findOne(PurchaseOrders, {
            where: { id: savedOrder.id },
            relations: ['supplier', 'user', 'purchaseOrderDetails', 'purchaseOrderDetails.product'],
          });
        });

        return {
          status: true,
          message: "Purchase order created successfully",
          tap: "CREATED",
          purchaseOrder: result,
        };
      } catch (error: any) {
        console.error("Create purchase order error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    updatePurchaseOrder: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid purchase order ID", tap: "INVALID_INPUT" };
        }

        const purchaseOrder = await purchaseOrderRepository.findOneBy({ id });

        if (!purchaseOrder) {
          return { status: false, message: "Purchase order not found", tap: "NOT_FOUND" };
        }

        Object.assign(purchaseOrder, data);
        const updatedPurchaseOrder = await purchaseOrderRepository.save(purchaseOrder);

        return {
          status: true,
          message: "Purchase order updated successfully",
          tap: "UPDATED",
          purchaseOrder: updatedPurchaseOrder,
        };
      } catch (error: any) {
        console.error("Update purchase order error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    deletePurchaseOrder: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const orderId = args.input.id;

        if (!orderId || orderId.trim() === '') {
          return { status: false, message: "Invalid purchase order ID", tap: "INVALID_INPUT" };
        }

        const purchaseOrder = await purchaseOrderRepository.findOneBy({ id: orderId });

        if (!purchaseOrder) {
          return { status: false, message: "Purchase order not found", tap: "NOT_FOUND" };
        }

        await purchaseOrderRepository.remove(purchaseOrder);

        return { status: true, message: "Purchase order deleted successfully", tap: "DELETED" };
      } catch (error: any) {
        console.error("Delete purchase order error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },
};
