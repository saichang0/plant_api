import { AppDataSource } from "../../config/db.js";
import { Categories } from "../models/category.entity.js";
import { requireAuth } from "../../requireAuth.js";

const categoryRepository = AppDataSource.getRepository(Categories);

export const categoryResolver = {
  Query: {
    getCategory: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const categoryId = args.id;
        if (!categoryId || categoryId.trim() === '') {
          return { status: false, message: "Invalid category ID", tap: "INVALID_INPUT" };
        }

        const category = await categoryRepository.findOne({
          where: { id: categoryId },
          relations: ['products']
        });

        if (!category) {
          return { status: false, message: "Category not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Category found successfully",
          tap: "FOUND",
          category: category,
        };
      } catch (error: any) {
        console.error("Get category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getCategories: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const categories = await categoryRepository.find({
          relations: ['products']
        });

        return {
          status: true,
          message: "Categories retrieved successfully",
          tap: "FETCHED",
          categories: categories,
        };
      } catch (error: any) {
        console.error("Get categories error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createCategory: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { name } = args.input;

        const newCategory = categoryRepository.create({
          name,
        });

        const savedCategory = await categoryRepository.save(newCategory);

        return {
          status: true,
          message: "Category created successfully",
          tap: "CREATED",
          category: savedCategory,
        };
      } catch (error: any) {
        console.error("Create category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updateCategory: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid category ID", tap: "INVALID_INPUT" };
        }

        const category = await categoryRepository.findOneBy({ id });

        if (!category) {
          return { status: false, message: "Category not found", tap: "NOT_FOUND" };
        }

        Object.assign(category, data);
        const updatedCategory = await categoryRepository.save(category);

        return {
          status: true,
          message: "Category updated successfully",
          tap: "UPDATED",
          category: updatedCategory,
        };
      } catch (error: any) {
        console.error("Update category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteCategory: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const categoryId = args.input.id;

        if (!categoryId || categoryId.trim() === '') {
          return { status: false, message: "Invalid category ID", tap: "INVALID_INPUT" };
        }

        const category = await categoryRepository.findOneBy({ id: categoryId });

        if (!category) {
          return { status: false, message: "Category not found", tap: "NOT_FOUND" };
        }

        await categoryRepository.remove(category);

        return {
          status: true,
          message: "Category deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },
};
