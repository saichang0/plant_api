import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthPayload {
  id: string;
  userId: string;
  email?: string;
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = (req.headers.authorization as string) || "";
    if (!header) return next();

    const token = header.toLowerCase().startsWith("bearer ")
      ? header.slice(7)
      : header;

    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as AuthPayload;
    (req as any).user = { id: decoded?.id, email: decoded?.email } as AuthPayload;
    return next();
  } catch {
    return next();
  }
}