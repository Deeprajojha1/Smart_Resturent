import { Router } from "express";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";
import { updateUserRole } from "../controllers/user.controller";

const router = Router();

// Admin-only: update user role
router.patch("/:id/role", authenticate, authorize("admin"), updateUserRole);

export default router;
