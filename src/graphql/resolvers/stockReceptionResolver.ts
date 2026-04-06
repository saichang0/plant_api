import { AppDataSource } from "../../config/db.js";
import { StockReceptions } from "../models/stockReception.entity.js";
import { StockReceptionDetails } from "../models/stockReceptionDetail.entity.js";
import { PurchaseOrders } from "../models/purchaseOrder.entity.js";
import { requireAuth } from "@/requireAuth.js";

const stockReceptionRepository = AppDataSource.getRepository(StockReceptions);

export const stockReceptionResolver = {
  Query: {
    getStockReception: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const receptionId = args.id;
        if (!receptionId || receptionId.trim() === '') {
          return { status: false, message: "Invalid stock reception ID", tap: "INVALID_INPUT" };
        }

        const stockReception = await stockReceptionRepository.findOne({
          where: { id: receptionId },
          relations: ['purchaseOrder', 'purchaseOrder.supplier', 'user', 'stockReceptionDetails', 'stockReceptionDetails.product']
        });

        if (!stockReception) {
          return { status: false, message: "Stock reception not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Stock reception found successfully",
          tap: "FOUND",
          stockReception,
        };
      } catch (error: any) {
        console.error("Get stock reception error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    getStockReceptions: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const stockReceptions = await stockReceptionRepository.find({
          relations: ['purchaseOrder', 'purchaseOrder.supplier', 'user', 'stockReceptionDetails', 'stockReceptionDetails.product'],
          order: { receptionDate: 'DESC' }
        });

        return {
          status: true,
          message: "Stock receptions retrieved successfully",
          tap: "FETCHED",
          stockReceptions,
        };
      } catch (error: any) {
        console.error("Get stock receptions error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },

  Mutation: {
    confirmPurchaseOrder: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        const authUser = requireAuth(context);
        const { purchaseOrderId, items } = args.input;

        if (!items || items.length === 0) {
          return { status: false, message: "At least one item is required", tap: "INVALID_INPUT" };
        }

        const result = await AppDataSource.transaction(async (manager) => {
          // Verify purchase order exists
          const purchaseOrder = await manager.findOne(PurchaseOrders, {
            where: { id: purchaseOrderId },
          });

          if (!purchaseOrder) {
            throw new Error("Purchase order not found");
          }

          // Calculate total from received items only
          const totalActualPrice = items
            .filter((item: any) => item.status === 'received')
            .reduce((sum: number, item: any) => sum + (item.actualCostPrice * item.quantityReceived), 0);

          // Create stock reception
          const newReception = manager.create(StockReceptions, {
            purchaseOrderId,
            userId: authUser.id,
            totalActualPrice,
          });
          const savedReception = await manager.save(StockReceptions, newReception);

          // Create stock reception details only for received items
          const receivedItems = items.filter((item: any) => item.status === 'received');
          if (receivedItems.length > 0) {
            const details = receivedItems.map((item: any) =>
              manager.create(StockReceptionDetails, {
                receptionId: savedReception.id,
                productId: item.productId,
                quantityReceived: item.quantityReceived,
                actualCostPrice: item.actualCostPrice,
                status: 'received',
              })
            );
            await manager.save(StockReceptionDetails, details);
          }

          // Update purchase order status to 'received'
          purchaseOrder.status = 'received';
          await manager.save(PurchaseOrders, purchaseOrder);

          // Return with relations loaded
          return manager.findOne(StockReceptions, {
            where: { id: savedReception.id },
            relations: ['purchaseOrder', 'purchaseOrder.supplier', 'user', 'stockReceptionDetails', 'stockReceptionDetails.product'],
          });
        });

        return {
          status: true,
          message: "Purchase order confirmed successfully",
          tap: "CONFIRMED",
          stockReception: result,
        };
      } catch (error: any) {
        console.error("Confirm purchase order error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    createStockReception: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        const authUser = requireAuth(context);
        const { purchaseOrderId, totalActualPrice } = args.input;

        const newStockReception = stockReceptionRepository.create({
          purchaseOrderId,
          userId: authUser.id,
          totalActualPrice,
        });

        const savedStockReception = await stockReceptionRepository.save(newStockReception);

        return {
          status: true,
          message: "Stock reception created successfully",
          tap: "CREATED",
          stockReception: savedStockReception,
        };
      } catch (error: any) {
        console.error("Create stock reception error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    updateStockReception: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid stock reception ID", tap: "INVALID_INPUT" };
        }

        const stockReception = await stockReceptionRepository.findOneBy({ id });

        if (!stockReception) {
          return { status: false, message: "Stock reception not found", tap: "NOT_FOUND" };
        }

        Object.assign(stockReception, data);
        const updatedStockReception = await stockReceptionRepository.save(stockReception);

        return {
          status: true,
          message: "Stock reception updated successfully",
          tap: "UPDATED",
          stockReception: updatedStockReception,
        };
      } catch (error: any) {
        console.error("Update stock reception error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    deleteStockReception: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);
        const receptionId = args.input.id;

        if (!receptionId || receptionId.trim() === '') {
          return { status: false, message: "Invalid stock reception ID", tap: "INVALID_INPUT" };
        }

        const stockReception = await stockReceptionRepository.findOneBy({ id: receptionId });

        if (!stockReception) {
          return { status: false, message: "Stock reception not found", tap: "NOT_FOUND" };
        }

        await stockReceptionRepository.remove(stockReception);

        return { status: true, message: "Stock reception deleted successfully", tap: "DELETED" };
      } catch (error: any) {
        console.error("Delete stock reception error:", error.message);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },
};
