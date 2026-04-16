import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";
import {
  assignRestaurantToUser,
  getUsers,
  updateUserRole,
} from "../controllers/user.controller";

const router = Router();

// Admin-only: list users for assignment
router.get("/", authenticate, authorize("admin"), getUsers);

// Admin-only: update user role
router.patch("/:id/role", authenticate, authorize("admin"), updateUserRole);

// Admin-only: assign restaurant to user
router.patch(
  "/:id/restaurant",
  authenticate,
  authorize("admin"),
  assignRestaurantToUser
);

export default router;
