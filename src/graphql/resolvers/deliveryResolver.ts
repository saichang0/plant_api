import { In } from "typeorm";
import { AppDataSource } from "../../config/db.js";
import { Deliveries } from "../models/delivery.entity.js";
import { Sale } from "../models/sale.entity.js";
import { requireAuth } from "../../requireAuth.js";

const deliveryRepository = AppDataSource.getRepository(Deliveries);
const saleRepository = AppDataSource.getRepository(Sale);

export const deliveryResolver = {
  // Map GraphQL enum keys (uppercase) <-> DB string values (lowercase).
  // Without this, GraphQL can't serialize a DB row whose status is e.g.
  // "packing" into the DeliveryStatus enum, and clients can't send PACKING.
  DeliveryStatus: {
    PACKING: 'packing',
    SHIPPING: 'shipping',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
  },
  Query: {
    getDelivery: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const deliveryId = args.id;
        if (!deliveryId || deliveryId.trim() === '') {
          return { status: false, message: "Invalid delivery ID", tap: "INVALID_INPUT" };
        }

        const delivery = await deliveryRepository.findOne({
          where: { id: deliveryId },
          relations: ['sale']
        });

        if (!delivery) {
          return { status: false, message: "Delivery not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Delivery found successfully",
          tap: "FOUND",
          delivery: delivery,
        };
      } catch (error: any) {
        console.error("Get delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getDeliveries: async (
      _: any,
      args: { saleStatus?: string; deliveryStatus?: string },
      context: any
    ): Promise<any> => {
      try {
        const authUser = requireAuth(context);

        // ── Self-heal step ─────────────────────────────────────────
        // Some sales may not have a Deliveries row yet (older orders,
        // or orders placed without picking a courier). Make sure every
        // sale of this owner that should have a delivery actually does.
        const ownerSaleWhere: any = { userId: authUser.id };
        if (args.saleStatus) ownerSaleWhere.status = args.saleStatus;

        const ownerSales = await saleRepository.find({
          where: ownerSaleWhere,
          select: { id: true } as any,
        });
        const saleIds = ownerSales.map(s => s.id);

        if (saleIds.length > 0) {
          const existing = await deliveryRepository.find({
            where: { saleId: In(saleIds) },
            select: { saleId: true } as any,
          });
          const haveDelivery = new Set(existing.map(d => d.saleId));
          const missing = saleIds.filter(id => !haveDelivery.has(id));
          if (missing.length > 0) {
            const placeholders = missing.map(saleId =>
              deliveryRepository.create({
                saleId,
                deliveryService: 'Not specified',
                status: 'packing',
              })
            );
            await deliveryRepository.save(placeholders);
          }
        }

        // ── Actual fetch ───────────────────────────────────────────
        const where: any = { sale: { userId: authUser.id } };
        if (args.saleStatus) where.sale.status = args.saleStatus;
        if (args.deliveryStatus) where.status = args.deliveryStatus;

        const [deliveries, total] = await deliveryRepository.findAndCount({
          where,
          relations: [
            'sale',
            'sale.customer',
            'sale.customerAddress',
            'sale.saleDetails',
            'sale.saleDetails.product',
            'sale.saleDetails.product.unit',
            'sale.saleDetails.unit',
            'sale.payments',
          ],
          order: { sale: { saleDate: 'DESC' } } as any,
        });

        return {
          status: true,
          message: "Deliveries retrieved successfully",
          tap: "FETCHED",
          total,
          deliveries,
        };
      } catch (error: any) {
        console.error("Get deliveries error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createDelivery: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { saleId, deliveryService, branch, trackingNumber, status = 'packing' } = args.input;

        const newDelivery = deliveryRepository.create({
          saleId,
          deliveryService,
          branch,
          trackingNumber,
          status,
        });

        const savedDelivery = await deliveryRepository.save(newDelivery);

        return {
          status: true,
          message: "Delivery created successfully",
          tap: "CREATED",
          delivery: savedDelivery,
        };
      } catch (error: any) {
        console.error("Create delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updateDelivery: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid delivery ID", tap: "INVALID_INPUT" };
        }

        const delivery = await deliveryRepository.findOneBy({ id });

        if (!delivery) {
          return { status: false, message: "Delivery not found", tap: "NOT_FOUND" };
        }

        Object.assign(delivery, data);
        // Auto-stamp shippedAt when the delivery transitions to a shipped state.
        const shippedStates = ['shipping', 'shipped', 'delivered'];
        if (
          data.status &&
          shippedStates.includes(String(data.status).toLowerCase()) &&
          !delivery.shippedAt
        ) {
          delivery.shippedAt = new Date();
        }
        const updatedDelivery = await deliveryRepository.save(delivery);

        return {
          status: true,
          message: "Delivery updated successfully",
          tap: "UPDATED",
          delivery: updatedDelivery,
        };
      } catch (error: any) {
        console.error("Update delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteDelivery: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const deliveryId = args.input.id;

        if (!deliveryId || deliveryId.trim() === '') {
          return { status: false, message: "Invalid delivery ID", tap: "INVALID_INPUT" };
        }

        const delivery = await deliveryRepository.findOneBy({ id: deliveryId });

        if (!delivery) {
          return { status: false, message: "Delivery not found", tap: "NOT_FOUND" };
        }

        await deliveryRepository.remove(delivery);

        return {
          status: true,
          message: "Delivery deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};
