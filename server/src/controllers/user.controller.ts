import type { Request, Response, NextFunction } from "express";
import { ROLES, type Role } from "../constants/roles";
import * as userService from "../services/user.service";

type UserError = Error & { statusCode?: number };

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
