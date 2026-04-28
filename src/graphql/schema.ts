import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';
import { CustomerTypeDefs } from './schema/customer.typeDefs.js';
import { productTypeDefs } from './schema/product.typeDefs.js';
import { productResolver } from './resolvers/productResolver.js';
import { wishlistTypeDefs } from './schema/whislist.typeDefs.js';
import { wishlistResolver } from './resolvers/whislistResolver.js';
import { ProductReviewResolver } from './resolvers/productReviewResolver.js';
import { ProductReviewsTypeDefs } from './schema/productReview.typeDefs.js';
import { customerResolver } from './resolvers/customerResolver.js';
import { SupplierTypeDefs } from './schema/supplier.typeDefs.js';
import { supplierResolver } from './resolvers/supplierResolver.js';
import { categoryTypeDefs } from './schema/category.typeDefs.js';
import { categoryResolver } from './resolvers/categoryResolver.js';
import { userTypeDefs } from './schema/user.typeDefs.js';
import { userResolver } from './resolvers/userResolver.js';
import { purchaseOrderTypeDefs } from './schema/purchaseOrder.type.Defs.js';
import { purchaseOrderResolver } from './resolvers/purchaseOrderResolver.js';
import { purchaseOrderDetailTypeDefs } from './schema/purchaseOrderDetail.typeDefs.js';
import { purchaseOrderDetailResolver } from './resolvers/purchaseOrderDetailResolver.js';
import { saleTypeDefs } from './schema/sale.typeDefs.js';
import { saleResolver } from './resolvers/saleResolver.js';
import { saleDetailTypeDefs } from './schema/saleDetail.typeDefs.js';
import { saleDetailResolver } from './resolvers/saleDetailResolver.js';
import { paymentTypeDefs } from './schema/payment.typeDefs.js';
import { paymentResolver } from './resolvers/paymentResolver.js';
import { deliveryTypeDefs } from './schema/delivery.typeDefs.js';
import { deliveryResolver } from './resolvers/deliveryResolver.js';
import { stockReceptionTypeDefs } from './schema/stockReception.typeDefs.js';
import { stockReceptionResolver } from './resolvers/stockReceptionResolver.js';
import { stockReceptionDetailTypeDefs } from './schema/stockReceptionDetail.typeDefs.js';
import { stockReceptionDetailResolver } from './resolvers/stockReceptionDetailResolver.js';
import { dashboardTypeDefs } from './schema/dashboard.typeDefs.js';
import { dashboardResolver } from './resolvers/dashboardResolver.js';
import { unitTypeDefs } from './schema/unit.typeDefs.js';
import { unitResolver } from './resolvers/unitResolver.js';
import { reportTypeDefs } from './schema/report.typeDefs.js';
import { reportResolver } from './resolvers/reportResolver.js';
import { customerAddressTypeDefs } from './schema/customerAddress.typeDefs.js';
import { customerAddressResolver } from './resolvers/customerAddressResolver.js';
const typeDefs = mergeTypeDefs([
  CustomerTypeDefs,
  productTypeDefs,
  wishlistTypeDefs,
  ProductReviewsTypeDefs,
  SupplierTypeDefs,
  categoryTypeDefs,
  userTypeDefs,
  purchaseOrderTypeDefs,
  purchaseOrderDetailTypeDefs,
  saleTypeDefs,
  saleDetailTypeDefs,
  paymentTypeDefs,
  deliveryTypeDefs,
  stockReceptionTypeDefs,
  stockReceptionDetailTypeDefs,
  dashboardTypeDefs,
  unitTypeDefs,
  reportTypeDefs,
  customerAddressTypeDefs,
]);

const resolvers = mergeResolvers([
  customerResolver,
  productResolver,
  wishlistResolver,
  ProductReviewResolver,
  supplierResolver,
  categoryResolver,
  userResolver,
  purchaseOrderResolver,
  purchaseOrderDetailResolver,
  saleResolver,
  saleDetailResolver,
  paymentResolver,
  deliveryResolver,
  stockReceptionResolver,
  stockReceptionDetailResolver,
  dashboardResolver,
  unitResolver,
  reportResolver,
  customerAddressResolver,
]);

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
