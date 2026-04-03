import type { Request, Response, NextFunction } from "express";
import {
  generateInsightsService,
  getInsightsService,
} from "../services/insights.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const generateInsights = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await generateInsightsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getInsights = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getInsightsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
