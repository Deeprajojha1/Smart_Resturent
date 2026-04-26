import { Router } from "express";
import {
  getPublicMenu,
  getPublicPreparedMenu,
  getPublicRestaurants,
} from "../controllers/public.controller";
import {
  createOnlineOrder,
  verifyOnlinePayment,
} from "../controllers/onlineOrder.controller";

const router = Router();

router.get("/restaurants", getPublicRestaurants);
router.get("/menu/:restaurantId", getPublicMenu);
router.get("/prepared-menu/:restaurantId", getPublicPreparedMenu);
router.post("/order", createOnlineOrder);
router.post("/verify-payment", verifyOnlinePayment);

export default router;
