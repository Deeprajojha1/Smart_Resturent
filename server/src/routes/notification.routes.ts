import { Router } from "express";
import { getNotifications } from "../controllers/notification.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.get("/", authenticate, authorize("manager", "admin"), getNotifications);

export default router;
