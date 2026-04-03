import { Router } from "express";
import {
  generateInsights,
  getInsights,
} from "../controllers/insights.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.get("/", authenticate, authorize("manager", "admin"), getInsights);
router.post(
  "/generate",
  authenticate,
  authorize("admin"),
  generateInsights
);

export default router;
