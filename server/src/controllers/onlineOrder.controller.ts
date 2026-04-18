import type { Request, Response, NextFunction } from "express";
import {
  createOnlineOrderService,
  getMonthlyOnlineOrderRecordService,
  getOnlineOrdersService,
  updateOnlineOrderStatusService,
  verifyOnlinePaymentService,
} from "../services/onlineOrder.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const createOnlineOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await createOnlineOrderService(req.body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const verifyOnlinePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await verifyOnlinePaymentService(req.body);
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getOnlineOrders = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getOnlineOrdersService(
      { id: req.user._id },
      {
        status: req.query.status ? String(req.query.status) : undefined,
        startDate: req.query.startDate ? String(req.query.startDate) : undefined,
        endDate: req.query.endDate ? String(req.query.endDate) : undefined,
      }
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getMonthlyOnlineOrderRecord = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getMonthlyOnlineOrderRecordService(
      { id: req.user._id },
      {
        month: req.query.month ? String(req.query.month) : undefined,
        year: req.query.year ? String(req.query.year) : undefined,
      }
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const updateOnlineOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const status = String(req.body.status);
    const allowed = [
      "pending",
      "confirmed",
      "preparing",
      "delivered",
      "cancelled",
    ] as const;

    if (!allowed.includes(status as (typeof allowed)[number])) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await updateOnlineOrderStatusService(
      String(req.params.id),
      status as (typeof allowed)[number],
      { id: req.user._id }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};
