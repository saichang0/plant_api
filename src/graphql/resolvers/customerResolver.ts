import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { msg } from "../../constants/massages.js";
import { sendOTPEmail } from "@/utils/emailService.js";
import { AppDataSource } from "../../config/db.js";
import { Customers } from "../models/customer.entity.js";
import { AuthResponse, Response } from '../../types/auth.js';
import { requireAuth } from '@/requireAuth.js';

const generateCustomerToken = (customer: any) => {
  const accessToken = jwt.sign(
    { id: customer.id, role: 'customer' },
    process.env.JWT_SECRET || 'default_secret',
    { expiresIn: '3d' }
  );
  const refreshToken = jwt.sign(
    { id: customer.id },
    process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

const customerRepository = AppDataSource.getRepository(Customers);

export const customerResolver = {
  Query: {
    customer: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const authUserId = requireAuth(context);
        if (!authUserId) {
          return {
            status: false,
            message: "Unauthorized",
            tap: "UNAUTHORIZED",
          };
        }

        const customerId = (args.id);
        if (!customerId || customerId.trim() === '') {
          return { status: false, message: "Invalid customer ID", tap: "INVALID_INPUT" };
        }

        const customer = await customerRepository.findOneBy({
          id: customerId,
        });

        if (!customer) {
          return { status: false, message: "Customer not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Customer found successfully",
          tap: "FOUND",
          customer: customer,
        };
      } catch (error: any) {
        console.error("Customer query error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },
  },

  Mutation: {
    createCustomer: async (_: any, { data }: { data: any }): Promise<AuthResponse> => {
      try {
        const existingCustomer = await customerRepository.findOne({
          where: [
            { email: data.email },
            { phoneNumber: data.phoneNumber }
          ]
        });
        if (existingCustomer) return { status: false, message: msg.ALREADY_EXISTS, tap: "ALREADY_EXISTS" };

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newCustomer = customerRepository.create({
          firstName: data.firstName,
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber,
          email: data.email,
          password: hashedPassword,
          profileImageUrl: data.profileImageUrl || null,
          address: data.address || ''
        });

        const savedCustomer = await customerRepository.save(newCustomer);
        const { password, ...customerWithoutPassword } = savedCustomer as any;

        const tokens = generateCustomerToken(savedCustomer);

        return {
          status: true,
          message: msg.SUCCESS,
          tap: "CREATED",
          customer: customerWithoutPassword,
          ...tokens
        };
      } catch (error: any) {
        console.error('Full error object:', error);
        if (error.errors) {
          console.error('Validation errors:', error.errors);
        }
        return { status: false, message: error.message, tap: "ERROR" };
      }
    },

    loginCustomer: async (_: any, args: { data: { identifier: string, password: string } }): Promise<AuthResponse> => {
      try {
        const { identifier, password } = args.data;

        if (!identifier || !password) {
          return { status: false, message: msg.INVALID_INPUT, tap: "INVALID_INPUT" };
        }

        const customer = await customerRepository.findOne({
          where: [
            { email: identifier },
            { phoneNumber: identifier }
          ]
        });

        if (!customer || !customer.password) {
          return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND" };
        }

        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
          return { status: false, message: msg.PASSWORD_MISMATCH, tap: "PASSWORD_MISMATCH" };
        }

        const { password: _, ...customerWithoutPassword } = customer as any;
        const tokens = generateCustomerToken(customer);

        return {
          status: true,
          message: msg.LOGIN_SUCCESS,
          tap: "LOGIN_SUCCESS",
          customer: customerWithoutPassword,
          ...tokens
        };
      } catch (error: any) {
        console.error('Login customer error:', error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    updateCustomer: async (_: any, args: { data: { id: string, data: any } }, context: any): Promise<AuthResponse> => {
      try {
        const authHeader = requireAuth(context);
        if (!authHeader) {
          return { status: false, message: "Unauthorized", tap: "UNAUTHORIZED", customer: null };
        }

        const customerId = (args.data.id);
        if (!customerId || customerId.trim() === '') {
          return { status: false, message: msg.INVALID_INPUT, tap: "INVALID_INPUT" };
        }

        const customer = await customerRepository.findOneBy({ id: customerId });
        if (!customer)
          return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND", customer: null };

        const updatedCustomer = await customerRepository.save({
          ...customer,
          ...args.data.data
        });

        return {
          status: true,
          message: msg.SUCCESS,
          tap: "UPDATED",
          customer: updatedCustomer
        };

      } catch (error: any) {
        console.error('Update error:', error);
        if (error.name === 'JsonWebTokenError') {
          return { status: false, message: "Invalid token", tap: "UNAUTHORIZED", customer: null };
        }
        return { status: false, message: error.message || "Update failed", tap: "ERROR", customer: null };
      }
    },

    deleteCustomer: async (_: any, args: { data: { id: string } }, context: any): Promise<AuthResponse> => {
      try {
        const authUserId = requireAuth(context);
        if (!authUserId) {
          return { status: false, message: msg.UNAUTHORIZED, tap: "UNAUTHORIZED" };
        }

        const customerId = args.data.id;
        if (!customerId || customerId.trim() === '') {
          return { status: false, message: msg.INVALID_INPUT, tap: "INVALID_INPUT" };
        }

        const customer = await customerRepository.findOneBy({ id: customerId });
        if (!customer) {
          return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND" };
        }

        await customerRepository.remove(customer);

        return { status: true, message: msg.SUCCESS, tap: "DELETED" };
      } catch (error: any) {
        console.error('Delete customer error:', error);
        return { status: false, message: error.message || "Delete failed", tap: "ERROR" };
      }
    },

    requestOTP: async (_: any, args: { data: { email: string } }): Promise<Response> => {
      try {
        const { email } = args.data;
        const customer = await customerRepository.findOne({ where: { email: email } });
        if (!customer) return { status: false, message: msg.NOT_FOUND, tap: "NOT_FOUND" };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 60 * 60 * 1000);

        customer.otp = otp;
        customer.otpExpiry = otpExpiry;
        await customerRepository.save(customer);

        await sendOTPEmail(email, otp);

        return { status: true, message: msg.OTP_SENT, tap: "OTP_SENT" };
      } catch (error: any) {
        console.error('Request OTP error:', error);
        return { status: false, message: error.message, tap: "ERROR" };
      }
    },

    verifyOTP: async (_: any, args: { data: { email: string; otp: string } }): Promise<Response> => {
      try {
        const { email, otp } = args.data;
        const customer = await customerRepository.findOne({ where: { email: email } });

        if (!customer) {
          return { status: false, message: msg.USER_NOT_FOUND, tap: "NOT_FOUND" };
        }

        // Check if OTP matches
        if (customer.otp !== otp) {
          return { status: false, message: msg.OTP_INVALID, tap: "OTP_INVALID" };
        }

        // Check if OTP is expired (handle nullable case)
        if (!customer.otpExpiry || customer.otpExpiry < new Date()) {
          return { status: false, message: msg.OTP_EXPIRED, tap: "OTP_EXPIRED" };
        }

        // Clear OTP after successful verification
        customer.otp = undefined;
        customer.otpExpiry = undefined;
        await customerRepository.save(customer);

        return {
          status: true,
          message: msg.OTP_VERIFIED,
          tap: "OTP_VERIFIED",
        };
      } catch (error: any) {
        console.error("Verify OTP error:", error);
        return { status: false, message: error.message, tap: "ERROR" };
      }
    },

    resetPassword: async (_: any, args: { data: { email: string; otp: string; password: string; confirmPassword: string } }): Promise<AuthResponse> => {
      try {
        const { email, otp, password, confirmPassword } = args.data;

        if (!email || !otp || !password || !confirmPassword) {
          return { status: false, message: msg.INVALID_INPUT, tap: "INVALID_INPUT" };
        }

        if (password !== confirmPassword) {
          return { status: false, message: msg.PASSWORD_MISMATCH, tap: "PASSWORD_MISMATCH" };
        }

        if (password.length < 8) {
          return { status: false, message: msg.PASSWORD_TOO_SHORT, tap: "PASSWORD_TOO_SHORT" };
        }

        const customer = await customerRepository.findOne({ where: { email } });

        if (!customer) {
          return { status: false, message: msg.USER_NOT_FOUND, tap: "NOT_FOUND" };
        }

        if (!customer.otp || customer.otp !== otp) {
          return { status: false, message: msg.OTP_INVALID, tap: "OTP_INVALID" };
        }

        if (!customer.otpExpiry || customer.otpExpiry < new Date()) {
          return { status: false, message: msg.OTP_EXPIRED, tap: "OTP_EXPIRED" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        customer.password = hashedPassword;
        customer.otp = undefined;
        customer.otpExpiry = undefined;

        const updatedCustomer = await customerRepository.save(customer);
        const { password: _, ...customerWithoutPassword } = updatedCustomer as any;
        const tokens = generateCustomerToken(updatedCustomer);

        return {
          status: true,
          message: msg.PASSWORD_UPDATE_SUCCESS,
          tap: "PASSWORD_RESET",
          customer: customerWithoutPassword,
          ...tokens
        };
      } catch (error: any) {
        console.error('Reset password error:', error);
        return { status: false, message: error.message || "Password reset failed", tap: "ERROR" };
      }
    },
  },
};
