import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import { verifyToken } from "../utils/jwt.utils";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email?: string;
    role?: string;
  };
}

const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const bearer = req.headers.authorization||req.cookies?.authorization as string | undefined;
  const headerToken = bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined;
  const cookieToken = req.cookies?.token as string | undefined;
  const token = cookieToken || headerToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token) as JwtPayload;
    req.user = {
      _id: String(payload.id),
      email: payload.email as string | undefined,
      role: payload.role as string | undefined,
    };
    return next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authenticate;
