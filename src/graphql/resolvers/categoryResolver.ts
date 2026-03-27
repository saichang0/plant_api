import { AppDataSource } from "../../config/db.js";
import { Categories } from "../models/category.entity.js";

const categoryRepository = AppDataSource.getRepository(Categories);

export const categoryResolver = {
  Query: {
    getCategory: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const categoryId = args.id;
        if (!categoryId || categoryId.trim() === '') {
          return { status: false, message: "Invalid category ID" };
        }

        const category = await categoryRepository.findOne({
          where: { id: categoryId },
          relations: ['products']
        });

        if (!category) {
          return { status: false, message: "Category not found" };
        }

        return {
          status: true,
          message: "Category found successfully",
          category: category,
        };
      } catch (error: any) {
        console.error("Get category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getCategories: async (): Promise<any> => {
      try {
        const categories = await categoryRepository.find({
          relations: ['products']
        });

        return {
          status: true,
          message: "Categories retrieved successfully",
          categories: categories,
        };
      } catch (error: any) {
        console.error("Get categories error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createCategory: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { name } = args.input;

        const newCategory = categoryRepository.create({
          name,
        });

        const savedCategory = await categoryRepository.save(newCategory);

        return {
          status: true,
          message: "Category created successfully",
          category: savedCategory,
        };
      } catch (error: any) {
        console.error("Create category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateCategory: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const categoryId = id;

        if (!categoryId || categoryId.trim() === '') {
          return { status: false, message: "Invalid category ID" };
        }

        const category = await categoryRepository.findOneBy({ id: categoryId });

        if (!category) {
          return { status: false, message: "Category not found" };
        }

        Object.assign(category, data);
        const updatedCategory = await categoryRepository.save(category);

        return {
          status: true,
          message: "Category updated successfully",
          category: updatedCategory,
        };
      } catch (error: any) {
        console.error("Update category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteCategory: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const categoryId = args.input.id;

        if (!categoryId || categoryId.trim() === '') {
          return { status: false, message: "Invalid category ID" };
        }

        const category = await categoryRepository.findOneBy({ id: categoryId });

        if (!category) {
          return { status: false, message: "Category not found" };
        }

        await categoryRepository.remove(category);

        return {
          status: true,
          message: "Category deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete category error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};