import type { Request, Response, NextFunction } from "express";
import {
  createOrderService,
  getOrderAnalyticsService,
  getOrdersService,
  getTopDishesService,
} from "../services/order.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const order = await createOrderService(req.body, { id: req.user._id });
    return res.status(201).json({ success: true, data: order });
  } catch (error) {
    return next(error);
  }
};

export const getOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const orders = await getOrdersService({ id: req.user._id }, {
      startDate: req.query.startDate ? String(req.query.startDate) : undefined,
      endDate: req.query.endDate ? String(req.query.endDate) : undefined,
    });

    return res.json({ success: true, data: orders });
  } catch (error) {
    return next(error);
  }
};

export const getAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getOrderAnalyticsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getTopDishes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getTopDishesService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
