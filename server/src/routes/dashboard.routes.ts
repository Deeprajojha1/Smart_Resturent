import { Router } from "express";
import {
  getDashboardAnalytics,
  getDashboardSummary,
} from "../controllers/dashboard.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.get(
  "/summary",
  authenticate,
  authorize("manager", "admin"),
  getDashboardSummary
);
router.get(
  "/analytics",
  authenticate,
  authorize("manager", "admin"),
  getDashboardAnalytics
);

export default router;
