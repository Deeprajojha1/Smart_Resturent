import { Router } from "express";
import {
  downloadPayslip,
  generateMonthlyPayroll,
  generatePayroll,
  getPayrollAnalytics,
  getPayrolls,
  paySalary,
} from "../controllers/payroll.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.get("/", authenticate, authorize("manager", "admin"), getPayrolls);
router.get(
  "/analytics",
  authenticate,
  authorize("manager", "admin"),
  getPayrollAnalytics
);
router.post(
  "/generate-monthly",
  authenticate,
  authorize("manager", "admin"),
  generateMonthlyPayroll
);
router.post(
  "/generate/:employeeId",
  authenticate,
  authorize("manager", "admin"),
  generatePayroll
);
router.get(
  "/payslip/:id",
  authenticate,
  authorize("manager", "admin"),
  downloadPayslip
);
router.post("/pay/:id", authenticate, authorize("manager", "admin"), paySalary);

export default router;
