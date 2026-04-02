import type { Request, Response, NextFunction } from "express";
import type { Role } from "../constants/roles";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: Role;
  };
}

const authorize =
  (...allowed: Role[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    return next();
  };

export default authorize;
