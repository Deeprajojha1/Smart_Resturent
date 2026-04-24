import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";
import {
  assignRestaurantToUser,
  deleteEmployeeByUser,
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

// Admin-only: delete employee record for a user in the admin's restaurant
router.delete("/:id/employee", authenticate, authorize("admin"), deleteEmployeeByUser);

export default router;
