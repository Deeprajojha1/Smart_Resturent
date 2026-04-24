import type { Request, Response, NextFunction } from "express";
import {
  addInventoryService,
  deleteInventoryItemService,
  getInventoryItemsService,
  getInventoryStatsService,
  getLowStockService,
  getReorderSuggestionsService,
  updateInventoryItemDetailsService,
  updateStockService,
} from "../services/inventory.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const addItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const item = await addInventoryService(req.body, { id: req.user._id });
    return res.status(201).json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const updateStock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const item = await updateStockService(
      String(req.params.id),
      Number(req.body.quantity),
      { id: req.user._id }
    );
    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const updateItemDetails = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const item = await updateInventoryItemDetailsService(
      String(req.params.id),
      req.body,
      { id: req.user._id }
    );
    return res.json({ success: true, data: item });
  } catch (error) {
    return next(error);
  }
};

export const deleteItem = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await deleteInventoryItemService(String(req.params.id), {
      id: req.user._id,
    });

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getLowStock = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getLowStockService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getInventoryItems = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getInventoryItemsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getStats = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getInventoryStatsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const getReorderSuggestions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getReorderSuggestionsService({ id: req.user._id });
    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
