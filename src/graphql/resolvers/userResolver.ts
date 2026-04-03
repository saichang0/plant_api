import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from "../../config/db.js";
import { sendOTPEmail } from "@/utils/emailService.js";
import { Users } from "../models/user.entity.js";
import { Customers } from "../models/customer.entity.js";
import { msg } from '@/constants/massages.js';
import { requireAuth } from '@/requireAuth.js';

const userRepository = AppDataSource.getRepository(Users);
const customerRepository = AppDataSource.getRepository(Customers);

const generateToken = (user: any) => {
  const accessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '3d' } // 3 days
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    { expiresIn: '7d' } // 7 days
  );
  return { accessToken, refreshToken };
};

export const userResolver = {
  Query: {
    getUsers: async (_: any, __: any, context: any): Promise<any> => {
      try {
        const authUserId = requireAuth(context);
        if (!authUserId) {
          return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED", users: [] };
        }

        const users = await userRepository.find({
          order: { createdAt: 'DESC' },
        });

        const usersWithoutPassword = users.map(({ password, ...u }) => u);

        return {
          status: true,
          message: msg.SUCCESS,
          tap: "FETCHED",
          users: usersWithoutPassword,
        };
      } catch (error: any) {
        console.error("Get users error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR", users: [] };
      }
    },

    getUser: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const authUserId = requireAuth(context);
        if (!authUserId) {
          return {
            status: false,
            message: "Unauthorized",
            tap: "UNAUTHORIZED",
          };
        }
        const userId = (args.id);
        if (!userId || userId.trim() === '') {
          return { status: false, message: "Invalid user ID", tap: "INVALID_INPUT" };
        }

        const user = await userRepository.findOne({
          where: { id: userId },
          relations: ['sales', 'purchaseOrders', 'stockReceptions']
        });

        if (!user) {
          return { status: false, message: "User not found", tap: "NOT_FOUND" };
        }

        // Remove password from response
        const { password, ...userWithoutPassword } = user;

        return {
          status: true,
          message: "User found successfully",
          tap: "FOUND",
          user: userWithoutPassword,
        };
      } catch (error: any) {
        console.error("Get user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createUser: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { password, ...userData } = args.input;

        // Check if user already exists (phone or email)
        const existingUser = await userRepository.findOne({
          where: [
            { phoneNumber: userData.phoneNumber },
            { email: userData.email }
          ]
        });
        if (existingUser) {
          return { status: false, message: msg.USER_EXISTS, tap: "ALREADY_EXISTS" };
        }

        // Check if phone/email already registered as customer
        const existingCustomer = await customerRepository.findOne({
          where: [
            { phoneNumber: userData.phoneNumber },
            { email: userData.email }
          ]
        });
        if (existingCustomer) {
          return { status: false, message: msg.ALREADY_EXISTS, tap: "ALREADY_EXISTS" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = userRepository.create({
          ...userData,
          password: hashedPassword,
        });

        const savedUserResult = await userRepository.save(newUser);
        const savedUser = Array.isArray(savedUserResult) ? savedUserResult[0] : savedUserResult;
        const { password: _, ...userWithoutPassword } = savedUser;
        const tokens = generateToken(savedUser);

        return {
          status: true,
          message: msg.USER_CREATED,
          tap: "CREATED",
          user: userWithoutPassword,
          ...tokens,
        };
      } catch (error: any) {
        console.error("Create user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    updateUser: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        const authUserId = requireAuth(context);
        if (!authUserId) {
          return {
            status: false,
            message: "Unauthorized",
            tap: "UNAUTHORIZED",
          };
        }

        const { id, data } = args.input;
        const userId = id;

        if (!userId || userId.trim() === '') {
          return { status: false, message: "Invalid user ID", tap: "INVALID_INPUT" };
        }

        const user = await userRepository.findOneBy({ id: userId });

        if (!user) {
          return { status: false, message: "User not found", tap: "NOT_FOUND" };
        }

        const { password, ...updateData } = data;
        if (password) {
          updateData.password = await bcrypt.hash(password, 10);
        }

        Object.assign(user, updateData);
        const updatedUser = await userRepository.save(user);

        const { password: _, ...userWithoutPassword } = updatedUser;

        return {
          status: true,
          message: "User updated successfully",
          tap: "UPDATED",
          user: userWithoutPassword,
        };
      } catch (error: any) {
        console.error("Update user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteUser: async (_: any, args: { input: { id: string } }, context: any): Promise<any> => {
      try {
        const authUserId = requireAuth(context);
        if (!authUserId) {
          return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED" };
        }

        const userId = args.input.id;
        if (!userId || userId.trim() === '') {
          return { status: false, message: "Invalid user ID", tap: "INVALID_INPUT" };
        }

        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
          return { status: false, message: msg.USER_NOT_FOUND, tap: "NOT_FOUND" };
        }

        await userRepository.remove(user);

        return { status: true, message: "User deleted successfully", tap: "DELETED" };
      } catch (error: any) {
        console.error("Delete user error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    loginUser: async (_: any, args: { input: any }): Promise<any> => {
      try {
        const { identifier, password } = args.input;

        if (!identifier || !password) {
          return { status: false, message: "Identifier and password are required", tap: "INVALID_INPUT" };
        }

        const user = await userRepository.findOne({
          where: [
            { email: identifier },
            { phoneNumber: identifier }
          ]
        });

        if (!user) {
          return { status: false, message: "User not found", tap: "NOT_FOUND" };
        }

        if (!user.password) {
          return { status: false, message: "User password not set", tap: "ERROR" };
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return { status: false, message: msg.INVALID_CREDENTIALS, tap: "PASSWORD_MISMATCH" };
        }

        const { password: _, ...userWithoutPassword } = user;
        const tokens = generateToken(user);

        return {
          status: true,
          message: "Login successful",
          tap: "LOGIN_SUCCESS",
          user: userWithoutPassword,
          ...tokens,
        };
      } catch (error: any) {
        console.error("Login user error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    requestUserOTP: async (_: any, args: { data: { email: string } }): Promise<any> => {
      try {
        const { email } = args.data;
        const user = await userRepository.findOne({ where: { email: email } });
        if (!user) return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND" };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 60 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await userRepository.save(user);

        await sendOTPEmail(email, otp);

        return { status: true, message: msg.OTP_SENT, tap: "OTP_SENT" };
      } catch (error: any) {
        console.error('Request OTP error:', error);
        return { status: false, message: error.message, tap: "ERROR" };
      }
    },

    verifyUserOTP: async (_: any, args: { data: { email: string; otp: string } }): Promise<any> => {
      try {
        const { email, otp } = args.data;
        const user = await userRepository.findOne({ where: { email: email } });
        if (!user) return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND" };

        if (user.otp !== otp) {
          return { status: false, message: "Invalid OTP", tap: "OTP_INVALID" };
        }

        const now = new Date();
        if (user.otpExpiry && now > user.otpExpiry) {
          return { status: false, message: "OTP has expired", tap: "OTP_EXPIRED" };
        }

        return { status: true, message: "OTP verified successfully", tap: "OTP_VERIFIED" };
      } catch (error: any) {
        console.error('Verify OTP error:', error);
        return { status: false, message: error.message, tap: "ERROR" };
      }
    },

    resetUserPassword: async (_: any, args: { data: { email: string; otp: string; newPassword: string; confirmPassword: string } }): Promise<any> => {
      try {
        const { email, otp, newPassword, confirmPassword } = args.data;
        const user = await userRepository.findOne({ where: { email: email } });
        if (!user) return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND" };

        if (user.otp !== otp) {
          return { status: false, message: "Invalid OTP", tap: "OTP_INVALID" };
        }

        if (newPassword !== confirmPassword) {
          return { status: false, message: msg.PASSWORD_MISMATCH, tap: "PASSWORD_MISMATCH" };
        }

        const now = new Date();
        if (user.otpExpiry && now > user.otpExpiry) {
          return { status: false, message: "OTP has expired", tap: "OTP_EXPIRED" };
        }

        if (newPassword.length < 6) {
          return { status: false, message: msg.PASSWORD_TOO_SHORT, tap: "PASSWORD_TOO_SHORT" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null as any;
        user.otpExpiry = null as any;

        const updatedUser = await userRepository.save(user);
        const { password: _, ...userWithoutPassword } = updatedUser;
        const tokens = generateToken(updatedUser);

        return {
          status: true,
          message: msg.PASSWORD_UPDATE_SUCCESS,
          tap: "PASSWORD_RESET",
          user: userWithoutPassword,
          ...tokens
        };
      } catch (error: any) {
        console.error('Reset password error:', error);
        return { status: false, message: error.message, tap: "ERROR" };
      }
    },
  },
};
