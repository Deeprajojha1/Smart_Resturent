import type { Request, Response, NextFunction } from "express";
import { ROLES, type Role } from "../constants/roles";
import * as userService from "../services/user.service";
import { deleteEmployeeByUserService } from "../services/employee.service";

type UserError = Error & { statusCode?: number };

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userService.getUsers({
      search: req.query.search ? String(req.query.search) : undefined,
      role: req.query.role ? String(req.query.role) : undefined,
      restaurantId: req.query.restaurantId
        ? String(req.query.restaurantId)
        : undefined,
    });

    return res.json({ success: true, data: users });
  } catch (error) {
    return next(error);
  }
};

export const getInventoryHeadForCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const inventoryHead = await userService.getInventoryHeadForRequester(req.user._id);
    return res.json({ success: true, data: inventoryHead });
  } catch (error) {
    const err = error as UserError;
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    return next(error);
  }
};

export const getRestaurantVendorsForCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vendors = await userService.getVendorsForRequesterRestaurant(req.user._id);
    return res.json({ success: true, data: vendors });
  } catch (error) {
    const err = error as UserError;
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    return next(error);
  }
};

export const updateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { role } = req.body as { role?: Role };

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing user id",
      });
    }

    if (!role || !ROLES.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed: ${ROLES.join(", ")}`,
      });
    }

    const user = await userService.updateRole(userId, role);
    return res.json({ success: true, data: user });
  } catch (error) {
    const err = error as UserError;
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    return next(error);
  }
};

export const assignRestaurantToUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { restaurantId } = req.body as { restaurantId?: string };

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing user id",
      });
    }
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Missing restaurantId",
      });
    }

    const user = await userService.assignRestaurant(userId, restaurantId);
    return res.json({ success: true, data: user });
  } catch (error) {
    const err = error as UserError;
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    return next(error);
  }
};

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const deleteEmployeeByUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "Missing user id",
      });
    }

    const result = await deleteEmployeeByUserService(userId, {
      id: req.user._id,
    });
    await userService.removeEmployeeFromRequesterRestaurant(userId, req.user._id);

    return res.json({ success: true, data: result });
  } catch (error) {
    const err = error as UserError;
    if (err.statusCode) {
      return res
        .status(err.statusCode)
        .json({ success: false, message: err.message });
    }
    return next(error);
  }
};
