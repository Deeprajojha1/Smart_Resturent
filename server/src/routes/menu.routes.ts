import { Router } from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from "../controllers/menu.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.post("/", authenticate, authorize("manager", "admin"), createMenuItem);
router.get("/", authenticate, authorize("manager", "admin"), getMenuItems);
router.patch("/:id", authenticate, authorize("manager", "admin"), updateMenuItem);
router.delete(
  "/:id",
  authenticate,
  authorize("manager", "admin"),
  deleteMenuItem
);

export default router;
