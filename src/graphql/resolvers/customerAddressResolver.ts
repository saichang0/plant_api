import { AppDataSource } from "../../config/db.js";
import { CustomerAddresses } from "../models/customerAddress.entity.js";
import { requireCustomer } from "../../requireAuth.js";

const addressRepository = AppDataSource.getRepository(CustomerAddresses);

export const customerAddressResolver = {
  Query: {
    customerAddresses: async (_: any, __: any, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        const data = await addressRepository.find({
          where: { customerId: authCustomer.id },
          order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
        return { status: true, message: "Addresses fetched", tap: "FETCHED", data };
      } catch (error: any) {
        console.error("customerAddresses error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR", data: [] };
      }
    },

    customerAddress: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        const addr = await addressRepository.findOneBy({ id: args.id, customerId: authCustomer.id });
        if (!addr) return { status: false, message: "Address not found", tap: "NOT_FOUND" };
        return { status: true, message: "Address found", tap: "FOUND", data: addr };
      } catch (error: any) {
        console.error("customerAddress error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },

  Mutation: {
    createCustomerAddress: async (_: any, { input }: any, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        return await AppDataSource.transaction(async (manager) => {
          // If this is set as default OR it's the first address, ensure it becomes the only default
          const existing = await manager.find(CustomerAddresses, { where: { customerId: authCustomer.id } });
          const shouldBeDefault = input.isDefault === true || existing.length === 0;

          if (shouldBeDefault && existing.length > 0) {
            await manager.update(CustomerAddresses, { customerId: authCustomer.id }, { isDefault: false });
          }

          const addr = manager.create(CustomerAddresses, {
            customerId: authCustomer.id,
            province: input.province,
            district: input.district,
            village: input.village,
            country: input.country || 'Laos',
            isDefault: shouldBeDefault,
          });
          const saved = await manager.save(addr);
          return { status: true, message: "Address created", tap: "CREATED", data: saved };
        });
      } catch (error: any) {
        console.error("createCustomerAddress error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    updateCustomerAddress: async (_: any, { input }: any, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        const { id, data } = input;
        return await AppDataSource.transaction(async (manager) => {
          const addr = await manager.findOneBy(CustomerAddresses, { id, customerId: authCustomer.id });
          if (!addr) return { status: false, message: "Address not found", tap: "NOT_FOUND" };

          if (data.isDefault === true) {
            await manager.update(CustomerAddresses, { customerId: authCustomer.id }, { isDefault: false });
          }

          Object.assign(addr, data);
          const saved = await manager.save(addr);
          return { status: true, message: "Address updated", tap: "UPDATED", data: saved };
        });
      } catch (error: any) {
        console.error("updateCustomerAddress error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    deleteCustomerAddress: async (_: any, { input }: any, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        const addr = await addressRepository.findOneBy({ id: input.id, customerId: authCustomer.id });
        if (!addr) return { status: false, message: "Address not found", tap: "NOT_FOUND" };
        await addressRepository.remove(addr);
        return { status: true, message: "Address deleted", tap: "DELETED" };
      } catch (error: any) {
        console.error("deleteCustomerAddress error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    setDefaultCustomerAddress: async (_: any, { id }: { id: string }, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        return await AppDataSource.transaction(async (manager) => {
          const addr = await manager.findOneBy(CustomerAddresses, { id, customerId: authCustomer.id });
          if (!addr) return { status: false, message: "Address not found", tap: "NOT_FOUND" };

          await manager.update(CustomerAddresses, { customerId: authCustomer.id }, { isDefault: false });
          addr.isDefault = true;
          const saved = await manager.save(addr);
          return { status: true, message: "Default address set", tap: "UPDATED", data: saved };
        });
      } catch (error: any) {
        console.error("setDefaultCustomerAddress error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },
};
