import { AppDataSource } from "../../config/db.js";
import { Sale } from "../models/sale.entity.js";
import { SaleDetails } from "../models/saleDetail.entity.js";
import { Products } from "../models/product.entity.js";
import { PurchaseOrders } from "../models/purchaseOrder.entity.js";
import { requireAuth } from "@/requireAuth.js";
import { Between, MoreThanOrEqual } from "typeorm";

const saleRepository = AppDataSource.getRepository(Sale);
const saleDetailRepository = AppDataSource.getRepository(SaleDetails);
const productRepository = AppDataSource.getRepository(Products);
const purchaseOrderRepository = AppDataSource.getRepository(PurchaseOrders);

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const dashboardResolver = {
  Query: {
    getDashboard: async (_: any, __: any, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const now = new Date();
        const todayStart = startOfDay(now);
        const weekStart = startOfWeek(now);
        const monthStart = startOfMonth(now);

        // Get 30 days ago for daily stats
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Today's sales
        const todaySales = await saleRepository.find({
          where: { saleDate: MoreThanOrEqual(todayStart) },
        });
        const todayTotal = todaySales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const todayOrderCount = todaySales.length;

        // This week's sales
        const weekSales = await saleRepository.find({
          where: { saleDate: MoreThanOrEqual(weekStart) },
        });
        const weekTotal = weekSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const weekOrderCount = weekSales.length;

        // This month's sales
        const monthSales = await saleRepository.find({
          where: { saleDate: MoreThanOrEqual(monthStart) },
        });
        const monthTotal = monthSales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
        const monthOrderCount = monthSales.length;

        // Total products & low stock
        const allProducts = await productRepository.find();
        const totalProducts = allProducts.length;
        const lowStockCount = allProducts.filter(p => p.stockQuantity <= 5).length;

        // Pending purchase orders
        const pendingPOs = await purchaseOrderRepository.count({
          where: { status: 'pending' },
        });

        // Daily stats (last 30 days)
        const last30DaysSales = await saleRepository.find({
          where: { saleDate: MoreThanOrEqual(thirtyDaysAgo) },
        });

        const dailyMap = new Map<string, { totalSales: number; orderCount: number }>();
        for (let i = 0; i < 30; i++) {
          const d = new Date(now);
          d.setDate(d.getDate() - (29 - i));
          const key = d.toISOString().split('T')[0];
          dailyMap.set(key, { totalSales: 0, orderCount: 0 });
        }

        last30DaysSales.forEach(sale => {
          const key = new Date(sale.saleDate).toISOString().split('T')[0];
          const existing = dailyMap.get(key);
          if (existing) {
            existing.totalSales += Number(sale.totalAmount);
            existing.orderCount += 1;
          }
        });

        const dailyStats = Array.from(dailyMap.entries()).map(([date, data]) => ({
          date,
          totalSales: data.totalSales,
          orderCount: data.orderCount,
        }));

        // Weekly stats (last 8 weeks)
        const eightWeeksAgo = new Date(now);
        eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
        eightWeeksAgo.setHours(0, 0, 0, 0);

        const last8WeeksSales = await saleRepository.find({
          where: { saleDate: MoreThanOrEqual(eightWeeksAgo) },
        });

        const weeklyMap = new Map<string, { totalSales: number; orderCount: number }>();
        for (let i = 0; i < 8; i++) {
          const weekDate = new Date(now);
          weekDate.setDate(weekDate.getDate() - (7 * (7 - i)));
          const key = `W${i + 1}`;
          weeklyMap.set(key, { totalSales: 0, orderCount: 0 });
        }

        last8WeeksSales.forEach(sale => {
          const saleDate = new Date(sale.saleDate);
          const diffDays = Math.floor((now.getTime() - saleDate.getTime()) / (1000 * 60 * 60 * 24));
          const weekIndex = 7 - Math.floor(diffDays / 7);
          if (weekIndex >= 0 && weekIndex < 8) {
            const key = `W${weekIndex + 1}`;
            const existing = weeklyMap.get(key);
            if (existing) {
              existing.totalSales += Number(sale.totalAmount);
              existing.orderCount += 1;
            }
          }
        });

        const weeklyStats = Array.from(weeklyMap.entries()).map(([date, data]) => ({
          date,
          totalSales: data.totalSales,
          orderCount: data.orderCount,
        }));

        // Top selling products (all time, top 5)
        const topProductsRaw = await saleDetailRepository
          .createQueryBuilder('sd')
          .select('sd.productId', 'productId')
          .addSelect('SUM(sd.quantity)', 'totalQuantity')
          .addSelect('SUM(sd.totalPrice)', 'totalRevenue')
          .groupBy('sd.productId')
          .orderBy('SUM(sd.totalPrice)', 'DESC')
          .limit(5)
          .getRawMany();

        const topProducts = await Promise.all(
          topProductsRaw.map(async (item: any) => {
            const product = await productRepository.findOneBy({ id: item.productId });
            return {
              productId: item.productId,
              name: product?.name || '-',
              imageUrl: product?.imageUrl || null,
              totalQuantity: parseInt(item.totalQuantity) || 0,
              totalRevenue: parseFloat(item.totalRevenue) || 0,
            };
          })
        );

        return {
          status: true,
          message: "Dashboard data retrieved successfully",
          data: {
            todaySales: todayTotal,
            todayOrders: todayOrderCount,
            weekSales: weekTotal,
            weekOrders: weekOrderCount,
            monthSales: monthTotal,
            monthOrders: monthOrderCount,
            totalProducts,
            lowStockCount,
            pendingPurchaseOrders: pendingPOs,
            dailyStats,
            weeklyStats,
            topProducts,
          },
        };
      } catch (error: any) {
        console.error("Dashboard error:", error.message);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};
