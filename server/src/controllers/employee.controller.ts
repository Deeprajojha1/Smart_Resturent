import type { Request, Response, NextFunction } from "express";
import {
  createEmployeeService,
  getEmployeesService,
  updateEmployeeService,
} from "../services/employee.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const createEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await createEmployeeService(req.body, { id: req.user._id });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getEmployees = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getEmployeesService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const updateEmployee = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await updateEmployeeService(
      String(req.params.id),
      req.body,
      { id: req.user._id }
    );
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
