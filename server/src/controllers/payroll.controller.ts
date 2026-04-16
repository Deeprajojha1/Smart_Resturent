import type { Request, Response, NextFunction } from "express";
import {
  createPayrollPaymentOrderService,
  generatePayrollService,
  generateMonthlyPayrollForAllService,
  generatePayslipPdfService,
  getPayrollAnalyticsService,
  getPayrollsService,
  paySalaryService,
  verifyPayrollPaymentService,
} from "../services/payroll.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const generatePayroll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await generatePayrollService(
      String(req.params.employeeId),
      { id: req.user._id }
    );
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getPayrolls = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getPayrollsService(
      { id: req.user._id },
      {
        month: req.query.month ? String(req.query.month) : undefined,
        year: req.query.year ? String(req.query.year) : undefined,
        status: req.query.status
          ? (String(req.query.status) as "pending" | "paid")
          : undefined,
        employeeId: req.query.employeeId
          ? String(req.query.employeeId)
          : undefined,
      }
    );
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getPayrollAnalytics = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getPayrollAnalyticsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const generateMonthlyPayroll = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await generateMonthlyPayrollForAllService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const paySalary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const paymentMethod = req.body.paymentMethod as "cash" | "card" | "upi";
    const data = await paySalaryService(
      String(req.params.id),
      { id: req.user._id },
      paymentMethod ?? "upi"
    );
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const createPayrollPaymentOrder = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const paymentMethod = req.body.paymentMethod as "card" | "upi";
    const data = await createPayrollPaymentOrderService(
      String(req.params.id),
      paymentMethod,
      { id: req.user._id }
    );

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const verifyPayrollPayment = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await verifyPayrollPaymentService(
      String(req.params.id),
      req.body,
      { id: req.user._id }
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const downloadPayslip = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const pdf = await generatePayslipPdfService(
      String(req.params.id),
      { id: req.user._id }
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="payslip-${req.params.id}.pdf"`
    );
    return res.send(pdf);
  } catch (error) {
    return next(error);
  }
};
