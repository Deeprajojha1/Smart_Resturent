import { Router } from "express";
import {
  createOrder,
  getAnalytics,
  getOrders,
  getTopDishes,
} from "../controllers/order.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

// POS (Cashier + Admin)
router.post("/", authenticate, authorize("cashier", "admin"), createOrder);

// Manager + Admin
router.get("/", authenticate, authorize("manager", "admin"), getOrders);

// Analytics
router.get(
  "/analytics",
  authenticate,
  authorize("manager", "admin"),
  getAnalytics
);

// Top dishes
router.get(
  "/top-dishes",
  authenticate,
  authorize("manager", "admin"),
  getTopDishes
);

export default router;
