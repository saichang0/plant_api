import { AppDataSource } from "../../config/db.js";
import { Categories } from "../models/category.entity.js";
import { requireOwner } from "../../requireAuth.js";

const categoryRepository = AppDataSource.getRepository(Categories);

export const categoryResolver = {
  Query: {
    getCategory: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const { owned } = requireOwner(context);

        const categoryId = args.id;
        if (!categoryId || categoryId.trim() === '') {
          return { status: false, message: "Invalid category ID", tap: "INVALID_INPUT" };
        }

        const category = await categoryRepository.findOne({
          where: { id: categoryId, ...owned },
          relations: ['products', 'creator']
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
        const { owned } = requireOwner(context);

        const categories = await categoryRepository.find({
          where: { ...owned },
          relations: ['products', 'creator'],
          order: { createdAt: 'DESC' },
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
        const { owned } = requireOwner(context);

        const { name } = args.input;

        const newCategory = categoryRepository.create({
          name,
          ...owned,
        });

        const savedCategory = await categoryRepository.save(newCategory);

        const full = await categoryRepository.findOne({
          where: { id: savedCategory.id },
          relations: ['creator'],
        });

        return {
          status: true,
          message: "Category created successfully",
          tap: "CREATED",
          category: full,
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
        const { owned } = requireOwner(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid category ID", tap: "INVALID_INPUT" };
        }

        const category = await categoryRepository.findOneBy({ id, ...owned });

        if (!category) {
          return { status: false, message: "Category not found", tap: "NOT_FOUND" };
        }

        Object.assign(category, data);
        await categoryRepository.save(category);

        const updated = await categoryRepository.findOne({
          where: { id },
          relations: ['creator'],
        });

        return {
          status: true,
          message: "Category updated successfully",
          tap: "UPDATED",
          category: updated,
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
        const { owned } = requireOwner(context);

        const categoryId = args.input.id;

        if (!categoryId || categoryId.trim() === '') {
          return { status: false, message: "Invalid category ID", tap: "INVALID_INPUT" };
        }

        const category = await categoryRepository.findOne({
          where: { id: categoryId, ...owned },
          relations: ['products'],
        });

        if (!category) {
          return { status: false, message: "Category not found", tap: "NOT_FOUND" };
        }

        if (category.products && category.products.length > 0) {
          return {
            status: false,
            message: `ບໍ່ສາມາດລຶບໄດ້ ເພາະມີ ${category.products.length} ສິນຄ້າໃນໝວດໝູ່ນີ້`,
            tap: "HAS_PRODUCTS",
          };
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
