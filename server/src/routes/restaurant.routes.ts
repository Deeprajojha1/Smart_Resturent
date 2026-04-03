import { Router } from "express";
import {
  createRestaurant,
  deleteRestaurant,
  getAllRestaurants,
  getMyRestaurant,
  getMyRestaurantById,
  updateRestaurant,
} from "../controllers/restaurant.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.post("/", authenticate, authorize("admin"), createRestaurant);
router.get("/", authenticate, authorize("admin"), getAllRestaurants);
router.get("/me", authenticate, getMyRestaurant);
router.get("/me/:id", authenticate, getMyRestaurantById);
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "manager"),
  updateRestaurant
);
router.delete("/:id", authenticate, authorize("admin"), deleteRestaurant);

export default router;
