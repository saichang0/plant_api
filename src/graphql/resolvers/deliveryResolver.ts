import { AppDataSource } from "../../config/db.js";
import { Deliveries } from "../models/delivery.entity.js";
import { requireAuth } from "../../requireAuth.js";

const deliveryRepository = AppDataSource.getRepository(Deliveries);

export const deliveryResolver = {
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

    getDeliveries: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const deliveries = await deliveryRepository.find({
          relations: ['sale']
        });

        return {
          status: true,
          message: "Deliveries retrieved successfully",
          tap: "FETCHED",
          deliveries: deliveries,
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

        const { saleId, deliveryService, trackingNumber, status = 'packing' } = args.input;

        const newDelivery = deliveryRepository.create({
          saleId,
          deliveryService,
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
