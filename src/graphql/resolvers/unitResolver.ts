import { AppDataSource } from "../../config/db.js";
import { Units } from "../models/unit.entity.js";
import { requireOwner } from "../../requireAuth.js";

const unitRepository = AppDataSource.getRepository(Units);

export const unitResolver = {
  Query: {
    getUnit: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const { owned } = requireOwner(context);

        const unitId = args.id;
        if (!unitId || unitId.trim() === '') {
          return { status: false, message: "Invalid unit ID", tap: "INVALID_INPUT" };
        }

        const unit = await unitRepository.findOne({
          where: { id: unitId, ...owned },
          relations: ['creator'],
        });

        if (!unit) {
          return { status: false, message: "Unit not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Unit found successfully",
          tap: "FOUND",
          unit,
        };
      } catch (error: any) {
        console.error("Get unit error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    getUnits: async (_: any, __: any, context: any): Promise<any> => {
      try {
        const { owned } = requireOwner(context);

        const units = await unitRepository.find({
          where: { ...owned },
          relations: ['creator'],
          order: { name: 'ASC' },
        });

        return {
          status: true,
          message: "Units retrieved successfully",
          tap: "FETCHED",
          units,
        };
      } catch (error: any) {
        console.error("Get units error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },

  Mutation: {
    createUnit: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        const { owned } = requireOwner(context);

        const { name, weightInGrams, isActive } = args.input;

        const existing = await unitRepository.findOne({
          where: { name, ...owned },
        });

        if (existing) {
          return {
            status: false,
            message: "Unit with this name already exists",
            tap: "ALREADY_EXISTS",
          };
        }

        const newUnit = unitRepository.create({
          name,
          weightInGrams,
          isActive: isActive ?? true,
          ...owned,
        });

        const savedUnit = await unitRepository.save(newUnit);

        const unitWithCreator = await unitRepository.findOne({
          where: { id: savedUnit.id },
          relations: ['creator'],
        });

        return {
          status: true,
          message: "Unit created successfully",
          tap: "CREATED",
          unit: unitWithCreator,
        };
      } catch (error: any) {
        console.error("Create unit error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    updateUnit: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        const { owned } = requireOwner(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid unit ID", tap: "INVALID_INPUT" };
        }

        const unit = await unitRepository.findOneBy({ id, ...owned });

        if (!unit) {
          return { status: false, message: "Unit not found", tap: "NOT_FOUND" };
        }

        Object.assign(unit, data);
        await unitRepository.save(unit);

        const updatedUnit = await unitRepository.findOne({
          where: { id },
          relations: ['creator'],
        });

        return {
          status: true,
          message: "Unit updated successfully",
          tap: "UPDATED",
          unit: updatedUnit,
        };
      } catch (error: any) {
        console.error("Update unit error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    deleteUnit: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        const { owned } = requireOwner(context);

        const unitId = args.input.id;

        if (!unitId || unitId.trim() === '') {
          return { status: false, message: "Invalid unit ID", tap: "INVALID_INPUT" };
        }

        const unit = await unitRepository.findOneBy({ id: unitId, ...owned });

        if (!unit) {
          return { status: false, message: "Unit not found", tap: "NOT_FOUND" };
        }

        await unitRepository.remove(unit);

        return {
          status: true,
          message: "Unit deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete unit error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },
};
