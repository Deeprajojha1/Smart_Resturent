import type { NextFunction, Request, Response } from "express";
import type { InventoryRequestStatus } from "../models/InventoryRequest.model";
import * as inventoryRequestService from "../services/inventoryRequest.service";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
  };
}

export const getInventoryRequests = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const status = req.query.status
      ? (String(req.query.status) as InventoryRequestStatus)
      : undefined;

    const data = await inventoryRequestService.getInventoryRequestsService(
      { id: req.user._id },
      { status }
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const createInventoryRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await inventoryRequestService.createInventoryRequestService(
      {
        itemName: String(req.body.itemName ?? ""),
        requestedQty: Number(req.body.requestedQty),
        availableQty:
          req.body.availableQty === undefined
            ? undefined
            : Number(req.body.availableQty),
        source:
          req.body.source === "pos_order" || req.body.source === "manual"
            ? req.body.source
            : undefined,
        sourceOrderId: req.body.sourceOrderId
          ? String(req.body.sourceOrderId)
          : undefined,
        notes: req.body.notes ? String(req.body.notes) : undefined,
      },
      { id: req.user._id }
    );

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const approveInventoryRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await inventoryRequestService.approveInventoryRequestService(
      String(req.params.id),
      { id: req.user._id },
      req.body.note ? String(req.body.note) : undefined
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const assignInventoryRequestVendor = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const vendorId = String(req.body.vendorId ?? "");
    if (!vendorId) {
      return res.status(400).json({ success: false, message: "vendorId is required." });
    }

    const data = await inventoryRequestService.assignVendorToInventoryRequestService(
      String(req.params.id),
      vendorId,
      req.body.eta ? String(req.body.eta) : undefined,
      { id: req.user._id },
      req.body.note ? String(req.body.note) : undefined
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const markInventoryRequestDispatched = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await inventoryRequestService.markInventoryRequestDispatchedService(
      String(req.params.id),
      { id: req.user._id },
      req.body.note ? String(req.body.note) : undefined
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const markInventoryRequestReceived = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await inventoryRequestService.markInventoryRequestReceivedService(
      String(req.params.id),
      { id: req.user._id },
      req.body.receivedQty === undefined ? undefined : Number(req.body.receivedQty),
      req.body.note ? String(req.body.note) : undefined
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const markInventoryRequestFulfilled = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await inventoryRequestService.markInventoryRequestFulfilledService(
      String(req.params.id),
      { id: req.user._id },
      req.body.note ? String(req.body.note) : undefined
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const closeInventoryRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await inventoryRequestService.closeInventoryRequestService(
      String(req.params.id),
      { id: req.user._id },
      req.body.note ? String(req.body.note) : undefined
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};

export const cancelInventoryRequest = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await inventoryRequestService.cancelInventoryRequestService(
      String(req.params.id),
      { id: req.user._id },
      req.body.note ? String(req.body.note) : undefined
    );

    return res.json({ success: true, data });
  } catch (error) {
    return next(error);
  }
};
