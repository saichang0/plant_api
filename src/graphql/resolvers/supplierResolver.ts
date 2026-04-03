import { AppDataSource } from "../../config/db.js";
import { Suppliers } from "../models/supplier.entity.js";
import { requireAuth } from "../../requireAuth.js";

const supplierRepository = AppDataSource.getRepository(Suppliers);

export const supplierResolver = {
  Query: {
    getSupplier: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const supplierId = args.id;
        if (!supplierId || supplierId.trim() === '') {
          return { status: false, message: "Invalid supplier ID", tap: "INVALID_INPUT" };
        }

        const supplier = await supplierRepository.findOne({
          where: { id: supplierId },
          relations: ['purchaseOrders']
        });

        if (!supplier) {
          return { status: false, message: "Supplier not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Supplier found successfully",
          tap: "FOUND",
          supplier: supplier,
        };
      } catch (error: any) {
        console.error("Get supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getSuppliers: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const suppliers = await supplierRepository.find({
          relations: ['purchaseOrders']
        });

        return {
          status: true,
          message: "Suppliers retrieved successfully",
          tap: "FETCHED",
          suppliers: suppliers,
        };
      } catch (error: any) {
        console.error("Get suppliers error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createSupplier: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { name, phoneNumber, email, address } = args.input;

        const existingSupplier = await supplierRepository.findOne({
          where: [
            { phoneNumber },
            { email }
          ]
        });

        if (existingSupplier) {
          const conflictField = existingSupplier.phoneNumber === phoneNumber ? "phone number" : "email";
          return {
            status: false,
            message: `Supplier with this ${conflictField} already exists`,
            tap: "ALREADY_EXISTS",
          };
        }

        const newSupplier = supplierRepository.create({
          name,
          phoneNumber,
          email,
          address,
        });

        const savedSupplier = await supplierRepository.save(newSupplier);

        return {
          status: true,
          message: "Supplier created successfully",
          tap: "CREATED",
          supplier: savedSupplier,
        };
      } catch (error: any) {
        console.error("Create supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updateSupplier: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid supplier ID", tap: "INVALID_INPUT" };
        }

        const supplier = await supplierRepository.findOneBy({ id });

        if (!supplier) {
          return { status: false, message: "Supplier not found", tap: "NOT_FOUND" };
        }

        Object.assign(supplier, data);
        const updatedSupplier = await supplierRepository.save(supplier);

        return {
          status: true,
          message: "Supplier updated successfully",
          tap: "UPDATED",
          supplier: updatedSupplier,
        };
      } catch (error: any) {
        console.error("Update supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteSupplier: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const supplierId = args.input.id;

        if (!supplierId || supplierId.trim() === '') {
          return { status: false, message: "Invalid supplier ID", tap: "INVALID_INPUT" };
        }

        const supplier = await supplierRepository.findOneBy({ id: supplierId });

        if (!supplier) {
          return { status: false, message: "Supplier not found", tap: "NOT_FOUND" };
        }

        await supplierRepository.remove(supplier);

        return {
          status: true,
          message: "Supplier deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};