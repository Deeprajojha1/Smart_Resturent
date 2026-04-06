import type { Request, Response, NextFunction } from "express";
import {
  createMenuItemService,
  deleteMenuItemService,
  getMenuItemsService,
  updateMenuItemService,
} from "../services/menu.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const createMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const item = await createMenuItemService(req.body, { id: req.user._id });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const getMenuItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const items = await getMenuItemsService({ id: req.user._id });
    return res.json({ success: true, data: items });
  } catch (error) {
    return next(error);
  }
};

export const updateMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const updated = await updateMenuItemService(
      String(req.params.id),
      req.body,
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

export const deleteMenuItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const deleted = await deleteMenuItemService(String(req.params.id), {
      id: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: { message: "Menu item deleted" } });
  } catch (error) {
    return next(error);
  }
};
