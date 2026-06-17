import { Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../../config/db.js';
import { requireAuth } from '../../requireAuth.js';
import { StockMovements } from '../models/stockMovement.entity.js';
import { Sale } from '../models/sale.entity.js';

const stockMovementRepository = AppDataSource.getRepository(StockMovements);
const saleRepository = AppDataSource.getRepository(Sale);

type HistoryFilter = {
  from?: string;
  to?: string;
  productId?: string;
  reason?: string;
  limit?: number;
  offset?: number;
};

function dateRange(from?: string, to?: string) {
  const f = from ? new Date(from) : null;
  const t = to ? new Date(to) : null;
  if (f && t) return Between(f, t);
  if (f) return MoreThanOrEqual(f);
  if (t) return LessThanOrEqual(t);
  return undefined;
}

export const historyResolver = {
  Query: {
    stockMovements: async (
      _: any,
      { filter }: { filter?: HistoryFilter },
      context: any,
    ): Promise<any> => {
      try {
        const auth = requireAuth(context);
        const f: HistoryFilter = filter || {};

        const where: any = { userId: auth.id };
        if (f.productId) where.productId = f.productId;
        if (f.reason) where.reason = f.reason;
        const range = dateRange(f.from, f.to);
        if (range) where.createdAt = range;

        const [data, total] = await stockMovementRepository.findAndCount({
          where,
          relations: ['product', 'user'],
          order: { createdAt: 'DESC' },
          take: f.limit ?? 50,
          skip: f.offset ?? 0,
        });

        return {
          status: true,
          message: 'Stock movements fetched',
          tap: 'FETCHED',
          data,
          total,
        };
      } catch (error: any) {
        console.error('stockMovements error:', error);
        return {
          status: false,
          message: error.message || 'Failed',
          tap: 'ERROR',
          data: [],
          total: 0,
        };
      }
    },

    salesHistory: async (
      _: any,
      { filter, status }: { filter?: HistoryFilter; status?: string },
      context: any,
    ): Promise<any> => {
      try {
        const auth = requireAuth(context);
        const f: HistoryFilter = filter || {};

        const where: any = { userId: auth.id };
        if (status) where.status = status;
        const range = dateRange(f.from, f.to);
        if (range) where.saleDate = range;

        const [sales, total] = await saleRepository.findAndCount({
          where,
          relations: [
            'customer',
            'user',
            'saleDetails',
            'saleDetails.product',
            'saleDetails.product.unit',
            'saleDetails.unit',
            'payments',
            'deliveries',
            'customerAddress',
          ],
          order: { saleDate: 'DESC' },
          take: f.limit ?? 50,
          skip: f.offset ?? 0,
        });

        return {
          status: true,
          message: 'Sales history fetched',
          tap: 'FETCHED',
          sales,
          total,
        };
      } catch (error: any) {
        console.error('salesHistory error:', error);
        return {
          status: false,
          message: error.message || 'Failed',
          tap: 'ERROR',
          sales: [],
          total: 0,
        };
      }
    },
  },
};
