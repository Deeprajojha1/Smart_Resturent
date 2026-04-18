import { Router } from "express";
import {
  addItem,
  getLowStock,
  getReorderSuggestions,
  getStats,
  updateStock,
} from "../controllers/inventory.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

// Inventory team + Manager + Admin
router.post("/", authenticate, authorize("inventory", "manager", "admin"), addItem);

router.patch(
  "/:id",
  authenticate,
  authorize("inventory", "manager", "admin"),
  updateStock
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
