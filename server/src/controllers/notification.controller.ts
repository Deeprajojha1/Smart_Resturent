import type { NextFunction, Request, Response } from "express";
import { getNotificationsService } from "../services/notification.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getNotificationsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
