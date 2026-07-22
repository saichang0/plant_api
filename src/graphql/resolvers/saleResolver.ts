import { In, Not, IsNull } from "typeorm";
import { AppDataSource } from "../../config/db.js";
import { Sale, SaleSource } from "../models/sale.entity.js";
import { SaleDetails } from "../models/saleDetail.entity.js";
import { Products } from "../models/product.entity.js";
import { Payments } from "../models/payment.entity.js";
import { Deliveries } from "../models/delivery.entity.js";
import { StockMovements } from "../models/stockMovement.entity.js";
import { requireAuth, requireCustomer } from "../../requireAuth.js";

const saleRepository = AppDataSource.getRepository(Sale);

/// Generates a unique short order code like "pl-1234". Retries on collision.
async function generateSaleCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const n = Math.floor(1000 + Math.random() * 9000); // 1000..9999
    const code = `pl-${n}`;
    const existing = await saleRepository.findOne({ where: { code } });
    if (!existing) return code;
  }
  // Final fallback: longer suffix to avoid running forever in unlikely contention.
  return `pl-${Date.now().toString().slice(-6)}`;
}

export const saleResolver = {
  Query: {
    getSale: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const authUser = requireAuth(context);

        const saleId = args.id;
        if (!saleId || saleId.trim() === '') {
          return { status: false, message: "Invalid sale ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOne({
          where: { id: saleId, userId: authUser.id },
          relations: ['customer', 'user', 'saleDetails', 'saleDetails.product', 'saleDetails.product.unit', 'saleDetails.unit', 'payments', 'deliveries', 'productReviews']
        });

        if (!sale) {
          return { status: false, message: "Sale not found", tap: "NOT_FOUND" };
        }

        return {
          status: true,
          message: "Sale found successfully",
          tap: "FOUND",
          sale,
        };
      } catch (error: any) {
        console.error("Get sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    getSales: async (_: any, args: { status?: string; source?: string; limit?: number; offset?: number }, context: any): Promise<any> => {
      try {
        const authUser = requireAuth(context);

        const where: any = {
          userId: authUser.id,
        };
        if (args.source) {
          where.source = args.source;
        } else {
          // No source specified: default to customer-app orders, which
          // always have a customerId. POS walk-in sales don't.
          where.customerId = Not(IsNull());
        }
        if (args.status) {
          where.status = args.status;
        }

        const [sales, total] = await saleRepository.findAndCount({
          where,
          relations: [
            'customer', 'user',
            'saleDetails', 'saleDetails.product', 'saleDetails.product.unit', 'saleDetails.unit',
            'payments', 'deliveries', 'customerAddress',
          ],
          order: { saleDate: 'DESC' },
          take: args.limit || 50,
          skip: args.offset || 0,
        });

        return {
          status: true,
          message: "Sales retrieved successfully",
          tap: "FETCHED",
          sales,
          total,
        };
      } catch (error: any) {
        console.error("Get sales error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    // ─── Customer-facing: list my orders ──────────────────────────
    myOrders: async (_: any, args: { status?: string; limit?: number; offset?: number }, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        const where: any = { customerId: authCustomer.id };
        if (args.status) where.status = args.status;

        const [sales, total] = await saleRepository.findAndCount({
          where,
          relations: [
            'user',
            'saleDetails', 'saleDetails.product', 'saleDetails.product.unit',
            'saleDetails.unit', 'payments', 'deliveries', 'customerAddress'
          ],
          order: { saleDate: 'DESC' },
          take: args.limit || 50,
          skip: args.offset || 0,
        });

        return {
          status: true,
          message: "Orders retrieved successfully",
          tap: "FETCHED",
          sales,
          total,
        };
      } catch (error: any) {
        console.error("myOrders error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },

    // ─── Customer-facing: single order detail ──────────────────────
    myOrder: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);

        if (!args.id || args.id.trim() === '') {
          return { status: false, message: "Invalid order ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOne({
          where: { id: args.id, customerId: authCustomer.id },
          relations: [
            'user',
            'saleDetails', 'saleDetails.product', 'saleDetails.product.unit',
            'saleDetails.unit', 'payments', 'deliveries', 'customerAddress', 'productReviews'
          ],
        });

        if (!sale) {
          return { status: false, message: "Order not found", tap: "NOT_FOUND" };
        }

        return { status: true, message: "Order found", tap: "FOUND", sale };
      } catch (error: any) {
        console.error("myOrder error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },

  Mutation: {
    createSale: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { customerId, userId, totalAmount, status = 'pending' } = args.input;

        const newSale = saleRepository.create({
          customerId,
          userId,
          totalAmount,
          status,
        });

        const savedSale = await saleRepository.save(newSale);

        return {
          status: true,
          message: "Sale created successfully",
          tap: "CREATED",
          sale: savedSale,
        };
      } catch (error: any) {
        console.error("Create sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    // Creates a full sale with all line items in one transaction
    createFullSale: async (_: any, args: { input: any }, context: any): Promise<any> => {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        requireAuth(context);

        const { customerId, userId, customerName, note, taxAmount = 0, discountAmount = 0, status = 'paid', source, items, payments: paymentInputs } = args.input;
        // Normalise channel: explicit input wins, otherwise default to web/POS.
        const saleSource: SaleSource = source === 'PLENT_APP' ? SaleSource.PLENT_APP : SaleSource.PLENT_WEB;
        const saleCode = await generateSaleCode();

        if (!items || items.length === 0) {
          return { status: false, message: "Sale must have at least one item", tap: "INVALID_INPUT" };
        }

        // Calculate total from items
        let subTotal = 0;
        let totalPlant = 0;
        for (const item of items) {
          subTotal += Number(item.totalPrice);
          totalPlant += Number(item.quantity) || 0;
        }

        const totalAmount = subTotal + Number(taxAmount) - Number(discountAmount);

        // Create the sale
        const sale = queryRunner.manager.create(Sale, {
          code: saleCode,
          customerId: customerId || undefined,
          userId,
          totalAmount,
          totalPlant,
          taxAmount: Number(taxAmount),
          discountAmount: Number(discountAmount),
          status,
          source: saleSource,
          customerName: customerName || undefined,
          note: note || undefined,
        });

        const savedSale = await queryRunner.manager.save(sale);

        // Create sale details
        const saleDetails: SaleDetails[] = [];
        for (const item of items) {
          const detail = queryRunner.manager.create(SaleDetails, {
            saleId: savedSale.id,
            productId: item.productId,
            quantity: Number(item.quantity),
            unitId: item.unitId || undefined,
            weightGrams: Number(item.weightGrams) || 0,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            note: item.note || undefined,
          });
          saleDetails.push(detail);

          // Deduct stock
          const product = await queryRunner.manager.findOneBy(Products, { id: item.productId });
          if (product) {
            const weightGrams = Number(item.weightGrams) || 0;
            const qty = Math.ceil(Number(item.quantity));
            const weightPerUnit = Number(product.weightPerUnit) || 0;
            const stockBefore = product.stockQuantity;

            // Check if this is the product's own unit (full bag)
            const unitName = (item.unit || '').toLowerCase();
            const isFullUnit = product.unitId && item.unitId && product.unitId === item.unitId
              && unitName !== 'kg' && unitName !== 'gram' && unitName !== 'ເຄິ່ງຖົງ';

            if (isFullUnit && weightPerUnit > 0) {
              // Full bag: deduct bags and weight
              product.stockQuantity = product.stockQuantity - qty;
              product.stockWeight = Number(product.stockWeight) - (qty * weightPerUnit);
            } else if (weightGrams > 0) {
              // Weight-based sale (kg, gram, half-bag): deduct from stockWeight
              product.stockWeight = Number(product.stockWeight) - weightGrams;
              // Recalculate stockQuantity (full bags) from remaining weight
              if (weightPerUnit > 0) {
                product.stockQuantity = Math.floor(Number(product.stockWeight) / weightPerUnit);
              }
            } else {
              // Pure piece-based (plants, etc.)
              product.stockQuantity = product.stockQuantity - qty;
            }
            await queryRunner.manager.save(product);

            // Audit: log the stock change.
            if (product.stockQuantity !== stockBefore) {
              const movement = queryRunner.manager.create(StockMovements, {
                productId: product.id,
                userId,
                change: product.stockQuantity - stockBefore,
                quantityBefore: stockBefore,
                quantityAfter: product.stockQuantity,
                reason: 'sale',
                referenceId: savedSale.id,
                referenceType: 'sale',
                note: `createFullSale (${savedSale.code ?? savedSale.id})`,
              });
              await queryRunner.manager.save(movement);
            }
          }
        }

        await queryRunner.manager.save(saleDetails);

        // Create payment records
        if (paymentInputs && paymentInputs.length > 0) {
          for (const p of paymentInputs) {
            const payment = queryRunner.manager.create(Payments, {
              saleId: savedSale.id,
              paymentMethod: p.paymentMethod,
              currency: p.currency,
              amount: Number(p.amount),
              slipImageUrl: p.slipImageUrl || undefined,
            });
            await queryRunner.manager.save(payment);
          }
        }

        await queryRunner.commitTransaction();

        // Fetch the full sale with relations
        const fullSale = await saleRepository.findOne({
          where: { id: savedSale.id },
          relations: ['customer', 'user', 'saleDetails', 'saleDetails.product', 'saleDetails.product.unit', 'saleDetails.unit', 'payments'],
        });

        return {
          status: true,
          message: "Sale completed successfully",
          tap: "CREATED",
          sale: fullSale,
        };
      } catch (error: any) {
        await queryRunner.rollbackTransaction();
        console.error("Create full sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      } finally {
        await queryRunner.release();
      }
    },

    updateSale: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const { id, data } = args.input;

        if (!id || id.trim() === '') {
          return { status: false, message: "Invalid sale ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOneBy({ id });

        if (!sale) {
          return { status: false, message: "Sale not found", tap: "NOT_FOUND" };
        }

        const previousStatus = sale.status;
        Object.assign(sale, data);

        // Stamp confirmedAt the first time the order transitions to "confirmed".
        if (
          data.status &&
          data.status.toLowerCase() === 'confirmed' &&
          previousStatus.toLowerCase() !== 'confirmed' &&
          !sale.confirmedAt
        ) {
          sale.confirmedAt = new Date();
        }

        const updatedSale = await saleRepository.save(sale);

        return {
          status: true,
          message: "Sale updated successfully",
          tap: "UPDATED",
          sale: updatedSale,
        };
      } catch (error: any) {
        console.error("Update sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    deleteSale: async (_: any, args: { input: any }, context: any): Promise<any> => {
      try {
        requireAuth(context);

        const saleId = args.input.id;

        if (!saleId || saleId.trim() === '') {
          return { status: false, message: "Invalid sale ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOneBy({ id: saleId });

        if (!sale) {
          return { status: false, message: "Sale not found", tap: "NOT_FOUND" };
        }

        await saleRepository.remove(sale);

        return {
          status: true,
          message: "Sale deleted successfully",
          tap: "DELETED",
        };
      } catch (error: any) {
        console.error("Delete sale error:", error);
        return {
          status: false,
          message: error.message || "An error occurred",
          tap: "ERROR",
        };
      }
    },

    // ─── Customer-facing: customer places an order ───────────────
    placeOrder: async (_: any, args: { input: any }, context: any): Promise<any> => {
      const queryRunner = AppDataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const authCustomer = requireCustomer(context);
        const { customerAddressId, note, items, payments: paymentInputs, deliveryService, deliveryBranch } = args.input;

        if (!items || items.length === 0) {
          await queryRunner.rollbackTransaction();
          return { status: false, message: "Order must have at least one item", tap: "INVALID_INPUT" };
        }

        // Load all products for the items and verify they're from the same shop
        const productIds = items.map((i: any) => i.productId);
        const products = await queryRunner.manager.findBy(Products, { id: In(productIds) } as any);
        if (products.length !== productIds.length) {
          await queryRunner.rollbackTransaction();
          return { status: false, message: "One or more products not found", tap: "NOT_FOUND" };
        }

        const shopOwnerIds = new Set(products.map(p => p.createdBy).filter(Boolean));
        if (shopOwnerIds.size > 1) {
          await queryRunner.rollbackTransaction();
          return { status: false, message: "Order can only contain products from one shop", tap: "MULTI_SHOP" };
        }
        const shopOwnerId = [...shopOwnerIds][0];
        if (!shopOwnerId) {
          await queryRunner.rollbackTransaction();
          return { status: false, message: "Shop owner not found for products", tap: "INVALID_INPUT" };
        }

        // Calculate total
        let subTotal = 0;
        let totalPlant = 0;
        for (const item of items) {
          subTotal += Number(item.totalPrice);
          totalPlant += Number(item.quantity) || 0;
        }

        // Create the sale (always tagged as coming from the mobile app)
        const saleCode = await generateSaleCode();
        const sale = queryRunner.manager.create(Sale, {
          code: saleCode,
          customerId: authCustomer.id,
          userId: shopOwnerId,
          totalAmount: subTotal,
          totalPlant,
          status: 'pending',
          source: SaleSource.PLENT_APP,
          customerAddressId: customerAddressId || undefined,
          note: note || undefined,
        });
        const savedSale = await queryRunner.manager.save(sale);

        // Create sale details + deduct stock (same logic as createFullSale)
        const saleDetails: SaleDetails[] = [];
        for (const item of items) {
          const detail = queryRunner.manager.create(SaleDetails, {
            saleId: savedSale.id,
            productId: item.productId,
            quantity: Number(item.quantity),
            unitId: item.unitId || undefined,
            weightGrams: Number(item.weightGrams) || 0,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.totalPrice),
            note: item.note || undefined,
          });
          saleDetails.push(detail);

          // Deduct stock (match createFullSale logic)
          const product = products.find(p => p.id === item.productId);
          if (product) {
            const weightGrams = Number(item.weightGrams) || 0;
            const qty = Math.ceil(Number(item.quantity));
            const weightPerUnit = Number(product.weightPerUnit) || 0;
            const unitName = (item.unit || '').toLowerCase();
            const isFullUnit = product.unitId && item.unitId && product.unitId === item.unitId
              && unitName !== 'kg' && unitName !== 'gram' && unitName !== 'ເຄິ່ງຖົງ';
            const stockBefore = product.stockQuantity;

            if (isFullUnit && weightPerUnit > 0) {
              product.stockQuantity = product.stockQuantity - qty;
              product.stockWeight = Number(product.stockWeight) - (qty * weightPerUnit);
            } else if (weightGrams > 0) {
              product.stockWeight = Number(product.stockWeight) - weightGrams;
              if (weightPerUnit > 0) {
                product.stockQuantity = Math.floor(Number(product.stockWeight) / weightPerUnit);
              }
            } else {
              product.stockQuantity = product.stockQuantity - qty;
            }
            await queryRunner.manager.save(product);

            // Audit: log the stock change.
            if (product.stockQuantity !== stockBefore) {
              const movement = queryRunner.manager.create(StockMovements, {
                productId: product.id,
                userId: shopOwnerId,
                change: product.stockQuantity - stockBefore,
                quantityBefore: stockBefore,
                quantityAfter: product.stockQuantity,
                reason: 'sale',
                referenceId: savedSale.id,
                referenceType: 'sale',
                note: `placeOrder (${savedSale.code ?? savedSale.id})`,
              });
              await queryRunner.manager.save(movement);
            }
          }
        }

        await queryRunner.manager.save(saleDetails);

        if (paymentInputs && paymentInputs.length > 0) {
          for (const p of paymentInputs) {
            const payment = queryRunner.manager.create(Payments, {
              saleId: savedSale.id,
              paymentMethod: p.paymentMethod,
              currency: p.currency,
              amount: Number(p.amount),
              slipImageUrl: p.slipImageUrl || undefined,
            });
            await queryRunner.manager.save(payment);
          }
        }

        // Record the courier the customer picked, so the shop owner knows
        // which shipping service + branch to hand the order off to.
        if (deliveryService && deliveryService.trim() !== '') {
          const delivery = queryRunner.manager.create(Deliveries, {
            saleId: savedSale.id,
            deliveryService: deliveryService.trim(),
            branch: deliveryBranch?.trim() || undefined,
            status: 'packing',
          });
          await queryRunner.manager.save(delivery);
        }

        await queryRunner.commitTransaction();

        const fullSale = await saleRepository.findOne({
          where: { id: savedSale.id },
          relations: [
            'user',
            'saleDetails', 'saleDetails.product', 'saleDetails.product.unit',
            'saleDetails.unit', 'payments', 'customerAddress', 'deliveries',
          ],
        });

        return {
          status: true,
          message: "Order placed successfully",
          tap: "CREATED",
          sale: fullSale,
        };
      } catch (error: any) {
        await queryRunner.rollbackTransaction();
        console.error("placeOrder error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      } finally {
        await queryRunner.release();
      }
    },

    // ─── Customer-facing: confirm they received the order ─────────
    confirmOrderReceived: async (_: any, args: { id: string }, context: any): Promise<any> => {
      try {
        const authCustomer = requireCustomer(context);
        if (!args.id || args.id.trim() === '') {
          return { status: false, message: "Invalid order ID", tap: "INVALID_INPUT" };
        }

        const sale = await saleRepository.findOne({
          where: { id: args.id, customerId: authCustomer.id },
        });
        if (!sale) {
          return { status: false, message: "Order not found", tap: "NOT_FOUND" };
        }

        // Only orders the shop has acted on can be confirmed received.
        const allowed = ['confirmed', 'shipping', 'shipped'];
        if (!allowed.includes(sale.status.toLowerCase())) {
          return {
            status: false,
            message: `Cannot confirm an order in "${sale.status}" status`,
            tap: "INVALID_STATE",
          };
        }

        sale.status = 'completed';
        const saved = await saleRepository.save(sale);

        // Best-effort: also flip the delivery to 'delivered'.
        await AppDataSource
          .getRepository(Deliveries)
          .createQueryBuilder()
          .update(Deliveries)
          .set({ status: 'delivered' })
          .where('saleId = :saleId', { saleId: sale.id })
          .execute();

        const fullSale = await saleRepository.findOne({
          where: { id: saved.id },
          relations: [
            'user',
            'saleDetails', 'saleDetails.product', 'saleDetails.product.unit',
            'saleDetails.unit', 'payments', 'customerAddress', 'deliveries',
          ],
        });

        return {
          status: true,
          message: "Order completed",
          tap: "COMPLETED",
          sale: fullSale,
        };
      } catch (error: any) {
        console.error("confirmOrderReceived error:", error);
        return { status: false, message: error.message || "An error occurred", tap: "ERROR" };
      }
    },
  },
};
