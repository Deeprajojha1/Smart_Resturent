import type { Request, Response, NextFunction } from "express";
import {
  createRestaurantService,
  deleteRestaurantService,
  getAllRestaurantsService,
  getMyRestaurantService,
  getMyRestaurantByIdService,
  updateRestaurantService,
} from "../services/restaurant.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role?: string;
  };
}

export const createRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const restaurant = await createRestaurantService(req.body, req.user._id);
    return res.status(201).json({ success: true, data: restaurant });
  } catch (error) {
    return next(error);
  }
};

export const getAllRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const restaurants = await getAllRestaurantsService({ page, limit, search });
    return res.json({ success: true, data: restaurants });
  } catch (error) {
    return next(error);
  }
};

export const getMyRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const restaurant = await getMyRestaurantService(req.user._id);
    return res.json({ success: true, data: restaurant });
  } catch (error) {
    return next(error);
  }
};

export const getMyRestaurantById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const restaurantId = String(req.params.id);
    const restaurant = await getMyRestaurantByIdService(
      req.user._id,
      restaurantId,
      req.user.role ?? ""
    );
    return res.json({ success: true, data: restaurant });
  } catch (error) {
    return next(error);
  }
};

export const updateRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const restaurantId = String(req.params.id);
    const updated = await updateRestaurantService(restaurantId, req.body, {
      id: req.user._id,
      role: req.user.role ?? "",
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: updated });
  } catch (error) {
    return next(error);
  }
};

export const deleteRestaurant = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const restaurantId = String(req.params.id);
    const deleted = await deleteRestaurantService(restaurantId, {
      id: req.user._id,
      role: req.user.role ?? "",
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: { message: "Restaurant deleted" } });
  } catch (error) {
    return next(error);
  }
};
