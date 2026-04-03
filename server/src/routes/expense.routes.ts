import { Router } from "express";
import {
  addExpense,
  deleteExpense,
  getExpenseAnalytics,
  getExpenses,
  getMonthlyExpense,
} from "../controllers/expense.controller";
import authenticate from "../middlewares/auth.middleware";
import authorize from "../middlewares/authorize.middleware";

const router = Router();

router.post("/", authenticate, authorize("manager", "admin"), addExpense);
router.get("/", authenticate, authorize("manager", "admin"), getExpenses);
router.get(
  "/analytics",
  authenticate,
  authorize("manager", "admin"),
  getExpenseAnalytics
);
router.get(
  "/monthly",
  authenticate,
  authorize("manager", "admin"),
  getMonthlyExpense
);
router.delete("/:id", authenticate, authorize("admin"), deleteExpense);

export default router;
