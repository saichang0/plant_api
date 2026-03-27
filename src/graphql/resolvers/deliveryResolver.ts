import { AppDataSource } from "../../config/db.js";
import { Deliveries } from "../models/delivery.entity.js";

const deliveryRepository = AppDataSource.getRepository(Deliveries);

export const deliveryResolver = {
  Query: {
    getDelivery: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const deliveryId = (args.id);
        if (!deliveryId || deliveryId.trim() === '') {
          return { status: false, message: "Invalid delivery ID" };
        }

        const delivery = await deliveryRepository.findOne({
          where: { id: deliveryId },
          relations: ['sale']
        });

        if (!delivery) {
          return { status: false, message: "Delivery not found" };
        }

        return {
          status: true,
          message: "Delivery found successfully",
          delivery: delivery,
        };
      } catch (error: any) {
        console.error("Get delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getDeliveries: async (): Promise<any> => {
      try {
        const deliveries = await deliveryRepository.find({
          relations: ['sale']
        });

        return {
          status: true,
          message: "Deliveries retrieved successfully",
          deliveries: deliveries,
        };
      } catch (error: any) {
        console.error("Get deliveries error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createDelivery: async (_: any, args: { input: any }): Promise<any> => {
      try {
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
          delivery: savedDelivery,
        };
      } catch (error: any) {
        console.error("Create delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateDelivery: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const deliveryId = (id);

        if (!deliveryId || deliveryId.trim() === '') {
          return { status: false, message: "Invalid delivery ID" };
        }

        const delivery = await deliveryRepository.findOneBy({ id: deliveryId });

        if (!delivery) {
          return { status: false, message: "Delivery not found" };
        }

        Object.assign(delivery, data);
        const updatedDelivery = await deliveryRepository.save(delivery);

        return {
          status: true,
          message: "Delivery updated successfully",
          delivery: updatedDelivery,
        };
      } catch (error: any) {
        console.error("Update delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteDelivery: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const deliveryId = (args.input.id);

        if (!deliveryId || deliveryId.trim() === '') {
          return { status: false, message: "Invalid delivery ID" };
        }

        const delivery = await deliveryRepository.findOneBy({ id: deliveryId });

        if (!delivery) {
          return { status: false, message: "Delivery not found" };
        }

        await deliveryRepository.remove(delivery);

        return {
          status: true,
          message: "Delivery deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete delivery error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};