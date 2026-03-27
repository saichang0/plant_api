import { AuthPayload } from "./authMiddleware.js";

export function requireAuth(context: any): AuthPayload {
  const req = context?.req;
  const user = req?.user as AuthPayload | undefined;
  if (!user?.id) throw new Error("Unauthorized");
  return user;
}
