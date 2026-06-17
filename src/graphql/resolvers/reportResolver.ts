import { AppDataSource } from "../../config/db.js";
import { Sale } from "../models/sale.entity.js";
import { SaleDetails } from "../models/saleDetail.entity.js";
import { Products } from "../models/product.entity.js";
import { Payments } from "../models/payment.entity.js";
import { Categories } from "../models/category.entity.js";
import { requireAuth } from "@/requireAuth.js";
import { MoreThanOrEqual, LessThanOrEqual, Between } from "typeorm";

const saleRepository = AppDataSource.getRepository(Sale);
const saleDetailRepository = AppDataSource.getRepository(SaleDetails);
const productRepository = AppDataSource.getRepository(Products);
const paymentRepository = AppDataSource.getRepository(Payments);
const categoryRepository = AppDataSource.getRepository(Categories);

export const reportResolver = {
  Query: {
    getReport: async (_: any, args: { startDate?: string; endDate?: string }, context: any): Promise<any> => {
      try {
        const authUser = requireAuth(context);

        // Date range (default: this month)
        const now = new Date();
        const start = args.startDate ? new Date(args.startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = args.endDate ? new Date(args.endDate + "T23:59:59") : now;
        start.setHours(0, 0, 0, 0);

        // Fetch all sales in range (scoped to owner)
        const sales = await saleRepository.find({
          where: { saleDate: Between(start, end), userId: authUser.id },
          relations: ['saleDetails', 'saleDetails.product', 'saleDetails.product.category', 'saleDetails.product.unit', 'saleDetails.unit', 'user', 'customer', 'payments'],
        });

        // ═══════════════════════════════════════════════
        // 1. Net Profit vs Gross Revenue
        // ═══════════════════════════════════════════════
        let grossRevenue = 0;
        let totalCost = 0;

        for (const sale of sales) {
          grossRevenue += Number(sale.totalAmount);
          for (const detail of (sale.saleDetails || [])) {
            const product = detail.product;
            if (product) {
              const weightGrams = Number(detail.weightGrams) || 0;
              const weightPerUnit = Number(product.weightPerUnit) || 0;

              if (weightGrams > 0 && weightPerUnit > 0) {
                // Weight-based sale: proportional cost based on weight sold vs unit weight
                totalCost += Number(product.costPrice) * (weightGrams / weightPerUnit);
              } else {
                // Piece/bag-based: costPrice * quantity
                totalCost += Number(product.costPrice) * Number(detail.quantity);
              }
            }
          }
        }

        const netProfit = grossRevenue - totalCost;
        const profitMargin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

        const profit = {
          grossRevenue,
          totalCost,
          netProfit,
          totalOrders: sales.length,
          profitMargin: Math.round(profitMargin * 100) / 100,
        };

        // ═══════════════════════════════════════════════
        // 2. Top Selling Products
        // ═══════════════════════════════════════════════
        const productMap = new Map<string, { name: string; imageUrl: string | null; categoryName: string; unitName: string; totalQuantity: number; totalRevenue: number }>();

        for (const sale of sales) {
          for (const detail of (sale.saleDetails || [])) {
            const pid = detail.productId;
            const existing = productMap.get(pid);
            const product = detail.product;
            if (existing) {
              existing.totalQuantity += Number(detail.quantity);
              existing.totalRevenue += Number(detail.totalPrice);
            } else {
              productMap.set(pid, {
                name: product?.name || "-",
                imageUrl: product?.imageUrl || null,
                categoryName: product?.category?.name || "-",
                unitName: detail.unit?.name || product?.unit?.name || "-",
                totalQuantity: Number(detail.quantity),
                totalRevenue: Number(detail.totalPrice),
              });
            }
          }
        }

        const topProducts = Array.from(productMap.entries())
          .map(([productId, data]) => ({ productId, ...data }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 10);

        // ═══════════════════════════════════════════════
        // 3. Sales by Category
        // ═══════════════════════════════════════════════
        const categoryMap = new Map<string, { categoryName: string; totalRevenue: number; totalOrders: Set<string> }>();

        for (const sale of sales) {
          for (const detail of (sale.saleDetails || [])) {
            const catId = detail.product?.category?.id || "uncategorized";
            const catName = detail.product?.category?.name || "ບໍ່ມີໝວດໝູ່";
            const existing = categoryMap.get(catId);
            if (existing) {
              existing.totalRevenue += Number(detail.totalPrice);
              existing.totalOrders.add(sale.id);
            } else {
              categoryMap.set(catId, {
                categoryName: catName,
                totalRevenue: Number(detail.totalPrice),
                totalOrders: new Set([sale.id]),
              });
            }
          }
        }

        const salesByCategory = Array.from(categoryMap.entries())
          .map(([categoryId, data]) => ({
            categoryId,
            categoryName: data.categoryName,
            totalRevenue: data.totalRevenue,
            totalOrders: data.totalOrders.size,
            percentage: grossRevenue > 0 ? Math.round((data.totalRevenue / grossRevenue) * 10000) / 100 : 0,
          }))
          .sort((a, b) => b.totalRevenue - a.totalRevenue);

        // ═══════════════════════════════════════════════
        // 4. Payment Method Breakdown
        // ═══════════════════════════════════════════════
        const paymentMap = new Map<string, { totalAmount: number; transactionCount: number }>();

        for (const sale of sales) {
          for (const payment of (sale.payments || [])) {
            const key = `${payment.paymentMethod}|${payment.currency}`;
            const existing = paymentMap.get(key);
            if (existing) {
              existing.totalAmount += Number(payment.amount);
              existing.transactionCount += 1;
            } else {
              paymentMap.set(key, {
                totalAmount: Number(payment.amount),
                transactionCount: 1,
              });
            }
          }
        }

        const totalPaymentAmount = Array.from(paymentMap.values()).reduce((sum, p) => sum + p.totalAmount, 0);

        const paymentBreakdown = Array.from(paymentMap.entries())
          .map(([key, data]) => {
            const [paymentMethod, currency] = key.split("|");
            return {
              paymentMethod,
              currency,
              totalAmount: data.totalAmount,
              transactionCount: data.transactionCount,
              percentage: totalPaymentAmount > 0 ? Math.round((data.totalAmount / totalPaymentAmount) * 10000) / 100 : 0,
            };
          })
          .sort((a, b) => b.totalAmount - a.totalAmount);

        // ═══════════════════════════════════════════════
        // 5. Order Status Summary
        // ═══════════════════════════════════════════════
        const statusMap = new Map<string, { count: number; totalAmount: number }>();

        for (const sale of sales) {
          const status = sale.status || "unknown";
          const existing = statusMap.get(status);
          if (existing) {
            existing.count += 1;
            existing.totalAmount += Number(sale.totalAmount);
          } else {
            statusMap.set(status, { count: 1, totalAmount: Number(sale.totalAmount) });
          }
        }

        const orderStatus = Array.from(statusMap.entries())
          .map(([status, data]) => ({
            status,
            count: data.count,
            totalAmount: data.totalAmount,
            percentage: sales.length > 0 ? Math.round((data.count / sales.length) * 10000) / 100 : 0,
          }))
          .sort((a, b) => b.count - a.count);

        // ═══════════════════════════════════════════════
        // 6. Receipts (latest 50)
        // ═══════════════════════════════════════════════
        const receipts = sales
          .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
          .slice(0, 50)
          .map(sale => ({
            saleId: sale.id,
            saleDate: sale.saleDate?.toISOString ? sale.saleDate.toISOString() : String(sale.saleDate),
            customerName:
              sale.customerName ||
              (sale.customer
                ? `${sale.customer.firstName} ${sale.customer.lastName ?? ""}`.trim()
                : null),
            staffName: sale.user ? `${sale.user.firstName} ${sale.user.lastName}` : null,
            items: (sale.saleDetails || []).map(d => ({
              productName: d.product?.name || "-",
              quantity: Number(d.quantity),
              unitName: d.unit?.name || d.product?.unit?.name || null,
              weightGrams: Number(d.weightGrams) || 0,
              unitPrice: Number(d.unitPrice),
              totalPrice: Number(d.totalPrice),
            })),
            subTotal: (sale.saleDetails || []).reduce((sum, d) => sum + Number(d.totalPrice), 0),
            taxAmount: Number(sale.taxAmount) || 0,
            discountAmount: Number(sale.discountAmount) || 0,
            totalAmount: Number(sale.totalAmount),
            status: sale.status,
            payments: (sale.payments || []).map(p => ({
              method: p.paymentMethod,
              currency: p.currency,
              amount: Number(p.amount),
            })),
          }));

        return {
          status: true,
          message: "Report generated successfully",
          data: {
            profit,
            topProducts,
            salesByCategory,
            paymentBreakdown,
            orderStatus,
            receipts,
          },
        };
      } catch (error: any) {
        console.error("Report error:", error.message);
        return {
          status: false,
          message: error.message || "An error occurred",
        };
      }
    },
  },
};
