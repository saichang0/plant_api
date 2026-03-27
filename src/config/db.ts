import 'reflect-metadata';
import dotenv from "dotenv";
import { DataSource } from "typeorm";
import { Products } from '@/graphql/models/product.entity.js';
import { Wishlists } from '@/graphql/models/wishList.entity.js';
import { Users } from '@/graphql/models/user.entity.js';
import { ProductReviews } from '@/graphql/models/productReview.entity.js';
import { Categories } from '@/graphql/models/category.entity.js';
import { Customers } from '@/graphql/models/customer.entity.js';
import { Deliveries } from '@/graphql/models/delivery.entity.js';
import { Payments } from '@/graphql/models/payment.entity.js';
import { PurchaseOrders } from '@/graphql/models/purchaseOrder.entity.js';
import { PurchaseOrderDetails } from '@/graphql/models/purchaseOrderDetail.entity.js';
import { Sale } from '@/graphql/models/sale.entity.js';
import { SaleDetails } from '@/graphql/models/saleDetail.entity.js';
import { StockReceptions } from '@/graphql/models/stockReception.entity.js';
import { StockReceptionDetails } from '@/graphql/models/stockReceptionDetail.entity.js';
import { Suppliers } from '@/graphql/models/supplier.entity.js';

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: true,
  entities: [
    Users,
    Products,
    Wishlists,
    ProductReviews,
    Categories,
    Customers,
    Deliveries,
    Payments,
    PurchaseOrders,
    PurchaseOrderDetails,
    Sale,
    SaleDetails,
    StockReceptions,
    StockReceptionDetails,
    Suppliers,
  ],
});
