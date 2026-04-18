import { Router } from "express";
import {
  getMonthlyOnlineOrderRecord,
  getOnlineOrders,
  updateOnlineOrderStatus,
} from "../controllers/onlineOrder.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.get("/", authenticate, authorize("manager", "admin"), getOnlineOrders);
router.get(
  "/monthly-record",
  authenticate,
  authorize("manager", "admin"),
  getMonthlyOnlineOrderRecord
);
router.patch(
  "/:id",
  authenticate,
  authorize("manager", "admin"),
  updateOnlineOrderStatus
);

export default router;
