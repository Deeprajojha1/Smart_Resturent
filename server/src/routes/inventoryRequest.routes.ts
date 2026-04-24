import { Router } from "express";
import {
  approveInventoryRequest,
  assignInventoryRequestVendor,
  cancelInventoryRequest,
  closeInventoryRequest,
  createInventoryRequest,
  getInventoryRequests,
  markInventoryRequestDispatched,
  markInventoryRequestFulfilled,
  markInventoryRequestReceived,
} from "../controllers/inventoryRequest.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(
    "cashier",
    "inventory",
    "inventory_head",
    "vendor",
    "manager",
    "admin"
  ),
  getInventoryRequests
);

router.post(
  "/",
  authenticate,
  authorize("cashier", "inventory", "inventory_head", "manager", "admin"),
  createInventoryRequest
);

router.patch(
  "/:id/approve",
  authenticate,
  authorize("inventory_head", "manager", "admin"),
  approveInventoryRequest
);

router.patch(
  "/:id/assign-vendor",
  authenticate,
  authorize("inventory_head", "manager", "admin"),
  assignInventoryRequestVendor
);

router.patch(
  "/:id/dispatch",
  authenticate,
  authorize("vendor", "inventory_head", "manager", "admin"),
  markInventoryRequestDispatched
);

router.patch(
  "/:id/receive",
  authenticate,
  authorize("inventory", "inventory_head", "manager", "admin"),
  markInventoryRequestReceived
);

router.patch(
  "/:id/fulfill",
  authenticate,
  authorize("cashier", "inventory", "inventory_head", "manager", "admin"),
  markInventoryRequestFulfilled
);

router.patch(
  "/:id/close",
  authenticate,
  authorize("inventory_head", "manager", "admin"),
  closeInventoryRequest
);

router.patch(
  "/:id/cancel",
  authenticate,
  authorize("inventory_head", "manager", "admin"),
  cancelInventoryRequest
);

export default router;
