import type { Request, Response, NextFunction } from "express";
import {
  getPublicMenuService,
  getPublicPreparedMenuService,
  getPublicRestaurantsService,
} from "../services/public.service";

export const getPublicRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const search = req.query.search ? String(req.query.search) : undefined;

    const restaurants = await getPublicRestaurantsService({
      page,
      limit,
      search,
    });

    return res.json({ success: true, data: restaurants });
  } catch (error) {
    return next(error);
  }
};

export const getPublicMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = String(req.params.restaurantId);
    const menu = await getPublicMenuService(restaurantId);
    return res.json({ success: true, data: menu });
  } catch (error) {
    return next(error);
  }
};

export const getPublicPreparedMenu = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const restaurantId = String(req.params.restaurantId);
    const menu = await getPublicPreparedMenuService(restaurantId);
    return res.json({ success: true, data: menu });
  } catch (error) {
    return next(error);
  }
};
