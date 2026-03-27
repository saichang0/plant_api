import { AppDataSource } from "../../config/db.js";
import { Suppliers } from "../models/supplier.entity.js";

const supplierRepository = AppDataSource.getRepository(Suppliers);

export const supplierResolver = {
  Query: {
    getSupplier: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const supplierId = (args.id);
        if (!supplierId || supplierId.trim() === '') {
          return { status: false, message: "Invalid supplier ID" };
        }

        const supplier = await supplierRepository.findOne({
          where: { id: supplierId },
          relations: ['purchaseOrders']
        });

        if (!supplier) {
          return { status: false, message: "Supplier not found" };
        }

        return {
          status: true,
          message: "Supplier found successfully",
          supplier: supplier,
        };
      } catch (error: any) {
        console.error("Get supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getSuppliers: async (): Promise<any> => {
      try {
        const suppliers = await supplierRepository.find({
          relations: ['purchaseOrders']
        });

        return {
          status: true,
          message: "Suppliers retrieved successfully",
          suppliers: suppliers,
        };
      } catch (error: any) {
        console.error("Get suppliers error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createSupplier: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { name, phoneNumber, email, address } = args.input;

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
          supplier: savedSupplier,
        };
      } catch (error: any) {
        console.error("Create supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateSupplier: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const supplierId = id;

        if (!supplierId || supplierId.trim() === '') {
          return { status: false, message: "Invalid supplier ID" };
        }

        const supplier = await supplierRepository.findOneBy({ id: supplierId });

        if (!supplier) {
          return { status: false, message: "Supplier not found" };
        }

        Object.assign(supplier, data);
        const updatedSupplier = await supplierRepository.save(supplier);

        return {
          status: true,
          message: "Supplier updated successfully",
          supplier: updatedSupplier,
        };
      } catch (error: any) {
        console.error("Update supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteSupplier: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const supplierId = args.input.id;

        if (!supplierId || supplierId.trim() === '') {
          return { status: false, message: "Invalid supplier ID" };
        }

        const supplier = await supplierRepository.findOneBy({ id: supplierId });

        if (!supplier) {
          return { status: false, message: "Supplier not found" };
        }

        await supplierRepository.remove(supplier);

        return {
          status: true,
          message: "Supplier deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete supplier error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};