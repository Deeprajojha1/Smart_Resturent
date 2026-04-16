import type { Request, Response, NextFunction } from "express";
import {
  addExpenseService,
  createExpensePaymentOrderService,
  deleteExpenseService,
  getExpenseAnalyticsService,
  getExpensesService,
  getMonthlyExpenseService,
  verifyExpensePaymentService,
} from "../services/expense.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const addExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await addExpenseService(req.body, { id: req.user._id });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const createExpensePaymentOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await createExpensePaymentOrderService(req.body, {
      id: req.user._id,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const verifyExpensePayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await verifyExpensePaymentService(req.body, {
      id: req.user._id,
    });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getExpenses = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getExpensesService(
      { id: req.user._id },
      {
        startDate: req.query.startDate ? String(req.query.startDate) : undefined,
        endDate: req.query.endDate ? String(req.query.endDate) : undefined,
        category: req.query.category ? String(req.query.category) : undefined,
        min: req.query.min ? String(req.query.min) : undefined,
        max: req.query.max ? String(req.query.max) : undefined,
      }
    );
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getExpenseAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getExpenseAnalyticsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getMonthlyExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getMonthlyExpenseService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await deleteExpenseService(String(req.params.id), { id: req.user._id });
    return res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
