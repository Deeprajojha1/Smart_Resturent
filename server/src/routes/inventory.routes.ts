import { Router } from "express";
import {
  addItem,
  deleteItem,
  getInventoryItems,
  getLowStock,
  getReorderSuggestions,
  getStats,
  updateItemDetails,
  updateStock,
} from "../controllers/inventory.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize("inventory", "inventory_head", "manager", "admin"),
  getInventoryItems
);

// Inventory team + Manager + Admin
router.post(
  "/",
  authenticate,
  authorize("inventory", "inventory_head", "manager", "admin"),
  addItem
);

router.patch(
  "/:id",
  authenticate,
  authorize("inventory", "inventory_head", "manager", "admin"),
  updateStock
);

router.patch(
  "/:id/details",
  authenticate,
  authorize("inventory", "inventory_head", "manager", "admin"),
  updateItemDetails
);

router.delete(
  "/:id",
  authenticate,
  authorize("inventory", "inventory_head", "manager", "admin"),
  deleteItem
);

// Manager + Admin (view)
router.get("/low-stock", authenticate, authorize("manager", "admin"), getLowStock);
router.get("/stats", authenticate, authorize("manager", "admin"), getStats);
router.get(
  "/reorder",
  authenticate,
  authorize("manager", "admin"),
  getReorderSuggestions
);

export default router;
