import type { NextFunction, Request, Response } from "express";
import {
  getDashboardAnalyticsService,
  getDashboardSummaryService,
} from "../services/dashboard.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const getDashboardSummary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getDashboardSummaryService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getDashboardAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getDashboardAnalyticsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
