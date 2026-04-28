import { AuthPayload } from "./authMiddleware.js";

export type Role = "admin" | "manager" | "staff" | "customer";

export function requireAuth(context: any): AuthPayload {
  const req = context?.req;
  const user = req?.user as AuthPayload | undefined;
  if (!user?.id) throw new Error("Unauthorized");
  return user;
}

/**
 * Require the authenticated user to have one of the allowed roles.
 * Usage: requireRole(context, "admin", "manager")
 */
export function requireRole(context: any, ...allowedRoles: Role[]): AuthPayload {
  const user = requireAuth(context);
  if (!user.role || !allowedRoles.includes(user.role as Role)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return user;
}

/**
 * Authenticate and return user + a reusable `createdBy` scope for owner-based filtering.
 * Usage:
 *   const { user, owned } = requireOwner(context);
 *   repo.find({ where: { ...owned } });
 *   repo.create({ ...data, ...owned });
 */
export function requireOwner(context: any): { user: AuthPayload; owned: { createdBy: string } } {
  const user = requireAuth(context);
  return { user, owned: { createdBy: user.id } };
}

/**
 * Require the authenticated user to be a customer (role === 'customer').
 * Used for customer-facing endpoints (mobile app).
 */
export function requireCustomer(context: any): AuthPayload {
  const user = requireAuth(context);
  if (user.role !== "customer") {
    throw new Error("Forbidden: customer account required");
  }
  return user;
}
