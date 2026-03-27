import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import nodemailer from 'nodemailer';
import { msg } from "../../constants/massages.js";
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
            tag: "Unauthorized",
          };
        }

        const customerId = (args.id);
        if (!customerId || customerId.trim() === '') {
          return { status: false, message: "Invalid customer ID", tag: "INVALID_ID" };
        }

        const customer = await customerRepository.findOneBy({
          id: customerId,
        });

        if (!customer) {
          return { status: false, message: "Customer not found", tag: "Not Found" };
        }

        return {
          status: true,
          message: "Customer found successfully",
          tag: "Success",
          customer: customer,
        };
      } catch (error: any) {
        console.error("Customer query error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tag: "Error",
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
        if (existingCustomer) return { status: false, message: msg.ALREADY_EXISTS, tag: "Customer Already Exists" };

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
          tag: "Customer Created",
          customer: customerWithoutPassword,
          ...tokens
        };
      } catch (error: any) {
        console.error('Full error object:', error);
        if (error.errors) {
          console.error('Validation errors:', error.errors);
        }
        return { status: false, message: error.message, tag: "Failed to create customer" };
      }
    },

    loginCustomer: async (_: any, args: { data: { identifier: string, password: string } }): Promise<AuthResponse> => {
      try {
        const { identifier, password } = args.data;

        if (!identifier || !password) {
          return { status: false, message: "Identifier and password are required", tag: "Invalid Input" };
        }

        const customer = await customerRepository.findOne({
          where: [
            { email: identifier },
            { phoneNumber: identifier }
          ]
        });

        if (!customer || !customer.password) {
          return { status: false, message: "Customer not found", tag: "Not Found" };
        }

        const isPasswordValid = await bcrypt.compare(password, customer.password);
        if (!isPasswordValid) {
          return { status: false, message: "Invalid password", tag: "Invalid Credentials" };
        }

        const { password: _, ...customerWithoutPassword } = customer as any;
        const tokens = generateCustomerToken(customer);

        return {
          status: true,
          message: "Login successful",
          tag: "Success",
          customer: customerWithoutPassword,
          ...tokens
        };
      } catch (error: any) {
        console.error('Login customer error:', error);
        return { status: false, message: error.message || "An error occurred", tag: "Error" };
      }
    },

    updateCustomer: async (_: any, args: { data: { id: string, data: any } }, context: any): Promise<AuthResponse> => {
      try {
        const authHeader = requireAuth(context);
        if (!authHeader) {
          return { status: false, message: "Unauthorized", tag: "Unauthorized", customer: null };
        }

        const customerId = (args.data.id);
        if (!customerId || customerId.trim() === '') {
          return { status: false, message: "Invalid customer ID", tag: "INVALID_ID" };
        }

        const customer = await customerRepository.findOneBy({ id: customerId });
        if (!customer)
          return { status: false, message: "Customer not found", tag: "Not Found Customer", customer: null };

        const updatedCustomer = await customerRepository.save({
          ...customer,
          ...args.data.data
        });

        return {
          status: true,
          tag: "Customer Updated",
          message: "Customer updated successfully",
          customer: updatedCustomer
        };

      } catch (error: any) {
        console.error('Update error:', error);
        if (error.name === 'JsonWebTokenError') {
          return { status: false, message: "Invalid token", tag: "Unauthorized", customer: null };
        }
        return { status: false, message: error.message || "Update failed", tag: "Update Failed", customer: null };
      }
    },

    deleteCustomer: async (_: any, args: { data: { id: string } }, context: any): Promise<AuthResponse> => {
      try {
        const authHeader = requireAuth(context);
        if (!authHeader) {
          return { status: false, message: "Unauthorized", tag: "Unauthorized", customer: null };
        }

        const customerId = (args.data.id);
        if (!customerId || customerId.trim() === '') {
          return { status: false, message: "Invalid customer ID", tag: "INVALID_ID" };
        }

        const customer = await customerRepository.findOne({ where: { id: customerId } });
        if (!customer) {
          return { status: false, message: msg.NOT_FOUND, tag: "Customer not found" };
        }
        await customerRepository.remove(customer);

        return {
          status: true,
          tag: "Customer Deleted",
          message: msg.SUCCESS,
          customer: null
        };
      } catch (error: any) {
        console.error('Delete error:', error);
        return { status: false, message: error.message, tag: "Delete Failed" };
      }
    },

    requestOTP: async (_: any, args: { data: { email: string } }): Promise<Response> => {
      try {
        const { email } = args.data;
        const customer = await customerRepository.findOne({ where: { email: email } });
        if (!customer) return { status: false, message: msg.NOT_FOUND, tag: "Not Found Customer" };

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 60 * 60 * 1000); 

        customer.otp = otp;
        customer.otpExpiry = otpExpiry;
        await customerRepository.save(customer);

        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        await transporter.sendMail({
          from: `"Your App" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your OTP Code",
          html: `<h3>${otp}</h3><p>Expires in 1 hour</p>`
        });

        return { status: true, message: msg.OTP_SENT, tag: "OTP Sent" };
      } catch (error: any) {
        console.error('Request OTP error:', error);
        return { status: false, message: error.message, tag: "Request OTP Failed" };
      }
    },

    verifyOTP: async (_: any, args: { data: { email: string; otp: string } }): Promise<Response> => {
      try {
        const { email, otp } = args.data;
        const customer = await customerRepository.findOne({ where: { email: email } });

        if (!customer) {
          return { status: false, message: msg.USER_NOT_FOUND, tag: "Not Found Customer" };
        }

        // Check if OTP matches
        if (customer.otp !== otp) {
          return { status: false, message: msg.OTP_INVALID, tag: "Invalid OTP" };
        }

        // Check if OTP is expired (handle nullable case)
        if (!customer.otpExpiry || customer.otpExpiry < new Date()) {
          return { status: false, message: msg.OTP_EXPIRED, tag: "OTP Expired" };
        }

        // Clear OTP after successful verification
        customer.otp = undefined;
        customer.otpExpiry = undefined;
        await customerRepository.save(customer);

        return {
          status: true,
          message: msg.OTP_VERIFIED,
          tag: "OTP Verified",
        };
      } catch (error: any) {
        console.error("Verify OTP error:", error);
        return { status: false, message: error.message, tag: "Verify OTP Failed" };
      }
    },


    resetPassword: async (_: any, args: { data: { email: string, password: string } }): Promise<Response> => {
      return {
        status: false,
        message: "Password reset not available for customers",
        tag: "Not Implemented"
      };
    },
  },
};

