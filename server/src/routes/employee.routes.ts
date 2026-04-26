import { Router } from "express";
import {
  createEmployee,
  getEmployees,
  updateEmployee,
} from "../controllers/employee.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.post("/", authenticate, authorize("manager", "admin"), createEmployee);
router.get("/", authenticate, authorize("inventory_head", "manager", "admin"), getEmployees);
router.patch("/:id", authenticate, authorize("manager", "admin"), updateEmployee);

export default router;
