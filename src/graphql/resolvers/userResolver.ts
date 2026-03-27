import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from "../../config/db.js";
import { Users } from "../models/user.entity.js";

const userRepository = AppDataSource.getRepository(Users);

const generateToken = (user: any) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

export const userResolver = {
  Query: {
    getUser: async (_: any, args: { id: string }): Promise<any> => {
      try {
        const userId = (args.id);
        if (!userId || userId.trim() === '') {
          return { status: false, message: "Invalid user ID" };
        }

        const user = await userRepository.findOne({
          where: { id: userId },
          relations: ['sales', 'purchaseOrders', 'stockReceptions']
        });

        if (!user) {
          return { status: false, message: "User not found" };
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
          status: true,
          message: "User found successfully",
          user: userWithoutPassword,
        };
      } catch (error: any) {
        console.error("Get user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    getUsers: async (): Promise<any> => {
      try {
        const users = await userRepository.find({
          relations: ['sales', 'purchaseOrders', 'stockReceptions']
        });

        // Remove passwords from response
        const usersWithoutPasswords = users.map(user => {
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        });

        return {
          status: true,
          message: "Users retrieved successfully",
          users: usersWithoutPasswords,
        };
      } catch (error: any) {
        console.error("Get users error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },

  Mutation: {
    createUser: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { password, ...userData } = args.input;

        const existingUser = await userRepository.findOne({ where: { phoneNumber: userData.phoneNumber } });
        if (existingUser) {
          return { status: false, message: "User with this phone number already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = userRepository.create({
          ...userData,
          password: hashedPassword,
        });

        const savedUser = await userRepository.save(newUser);
        const savedUserEntity = Array.isArray(savedUser) ? savedUser[0] : savedUser;

        const { password: _, ...userWithoutPassword } = savedUserEntity;
        const tokens = generateToken(savedUserEntity);

        return {
          status: true,
          message: "User created successfully",
          user: userWithoutPassword,
          ...tokens,
        };
      } catch (error: any) {
        console.error("Create user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    updateUser: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { id, data } = args.input;
        const userId = id;

        if (!userId || userId.trim() === '') {
          return { status: false, message: "Invalid user ID" };
        }

        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
          return { status: false, message: "User not found" };
        }

        const { password, ...updateData } = data;
        if (password) {
          updateData.password = await bcrypt.hash(password, 10);
        }

        Object.assign(user, updateData);
        const updatedUser = await userRepository.save(user);
        const updatedUserEntity = Array.isArray(updatedUser) ? updatedUser[0] : updatedUser;

        const { password: _, ...userWithoutPassword } = updatedUserEntity;

        return {
          status: true,
          message: "User updated successfully",
          user: userWithoutPassword,
        };
      } catch (error: any) {
        console.error("Update user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    deleteUser: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const userId = args.input.id;

        if (!userId || userId.trim() === '') {
          return { status: false, message: "Invalid user ID" };
        }

        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
          return { status: false, message: "User not found" };
        }

        await userRepository.remove(user);

        return {
          status: true,
          message: "User deleted successfully",
        };
      } catch (error: any) {
        console.error("Delete user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },

    loginUser: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { phoneNumber, password } = args.input;

        const user = await userRepository.findOne({ where: { phoneNumber } });

        if (!user) {
          return { status: false, message: "User not found" };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return { status: false, message: "Invalid password" };
        }

        const userEntity = Array.isArray(user) ? user[0] : user;
        const { password: _, ...userWithoutPassword } = userEntity;
        const tokens = generateToken(userEntity);

        return {
          status: true,
          message: "Login successful",
          user: userWithoutPassword,
          ...tokens,
        };
      } catch (error: any) {
        console.error("Login user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};