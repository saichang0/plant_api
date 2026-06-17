import { AppDataSource } from '../../config/db.js';
import { requireAuth } from '../../requireAuth.js';
import { BankAccounts } from '../models/bankAccount.entity.js';

const bankAccountRepository = AppDataSource.getRepository(BankAccounts);

export const bankAccountResolver = {
  Query: {
    bankAccounts: async (_: any, __: any, context: any): Promise<any> => {
      try {
        const auth = requireAuth(context);
        const accounts = await bankAccountRepository.find({
          where: { userId: auth.id },
          order: { createdAt: 'ASC' },
        });
        return {
          status: true,
          message: 'Bank accounts fetched',
          tap: 'FETCHED',
          data: accounts,
          total: accounts.length,
        };
      } catch (error: any) {
        console.error('bankAccounts error:', error);
        return {
          status: false,
          message: error.message || 'Failed',
          tap: 'ERROR',
          data: [],
          total: 0,
        };
      }
    },

    shopBankAccounts: async (
      _: any,
      { userId }: { userId: string },
    ): Promise<any> => {
      try {
        if (!userId || userId.trim() === '') {
          return {
            status: false,
            message: 'Invalid shop id',
            tap: 'INVALID_INPUT',
            data: [],
            total: 0,
          };
        }
        const accounts = await bankAccountRepository.find({
          where: { userId },
          order: { createdAt: 'ASC' },
        });
        return {
          status: true,
          message: 'Bank accounts fetched',
          tap: 'FETCHED',
          data: accounts,
          total: accounts.length,
        };
      } catch (error: any) {
        console.error('shopBankAccounts error:', error);
        return {
          status: false,
          message: error.message || 'Failed',
          tap: 'ERROR',
          data: [],
          total: 0,
        };
      }
    },
  },

  Mutation: {
    createBankAccount: async (
      _: any,
      { input }: { input: { bankName: string; qrImageUrl: string } },
      context: any,
    ): Promise<any> => {
      try {
        const auth = requireAuth(context);
        const bankName = (input.bankName || '').trim();
        const qrImageUrl = (input.qrImageUrl || '').trim();
        if (!bankName || !qrImageUrl) {
          return {
            status: false,
            message: 'Bank name and QR image are required',
            tap: 'INVALID_INPUT',
          };
        }
        const account = bankAccountRepository.create({
          userId: auth.id,
          bankName,
          qrImageUrl,
        });
        const saved = await bankAccountRepository.save(account);
        return {
          status: true,
          message: 'Bank account created',
          tap: 'CREATED',
          data: saved,
        };
      } catch (error: any) {
        console.error('createBankAccount error:', error);
        return { status: false, message: error.message || 'Failed', tap: 'ERROR' };
      }
    },

    updateBankAccount: async (
      _: any,
      { id, input }: { id: string; input: { bankName?: string; qrImageUrl?: string } },
      context: any,
    ): Promise<any> => {
      try {
        const auth = requireAuth(context);
        const existing = await bankAccountRepository.findOne({
          where: { id, userId: auth.id },
        });
        if (!existing) {
          return { status: false, message: 'Bank account not found', tap: 'NOT_FOUND' };
        }
        if (input.bankName !== undefined) {
          const trimmed = input.bankName.trim();
          if (trimmed) existing.bankName = trimmed;
        }
        if (input.qrImageUrl !== undefined) {
          const trimmed = input.qrImageUrl.trim();
          if (trimmed) existing.qrImageUrl = trimmed;
        }
        const saved = await bankAccountRepository.save(existing);
        return {
          status: true,
          message: 'Bank account updated',
          tap: 'UPDATED',
          data: saved,
        };
      } catch (error: any) {
        console.error('updateBankAccount error:', error);
        return { status: false, message: error.message || 'Failed', tap: 'ERROR' };
      }
    },

    deleteBankAccount: async (
      _: any,
      { id }: { id: string },
      context: any,
    ): Promise<any> => {
      try {
        const auth = requireAuth(context);
        const existing = await bankAccountRepository.findOne({
          where: { id, userId: auth.id },
        });
        if (!existing) {
          return { status: false, message: 'Bank account not found', tap: 'NOT_FOUND' };
        }
        await bankAccountRepository.remove(existing);
        return {
          status: true,
          message: 'Bank account deleted',
          tap: 'DELETED',
          data: { ...existing, id },
        };
      } catch (error: any) {
        console.error('deleteBankAccount error:', error);
        return { status: false, message: error.message || 'Failed', tap: 'ERROR' };
      }
    },
  },
};
