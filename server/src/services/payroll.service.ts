import crypto from "crypto";
import Employee from "../models/Employee.model";
import Expense from "../models/Expense.model";
import Payroll from "../models/Payroll.model";
import User from "../models/User.model";
import PDFDocument from "pdfkit";
import { getRazorpayClient } from "../config/razorpay.config";

type Requester = {
  id: string;
};

type PayrollQuery = {
  month?: string;
  year?: string;
  status?: "pending" | "paid";
  employeeId?: string;
};

type PayrollPaymentDraft = {
  requesterId: string;
  restaurantId: string;
  payrollId: string;
  paymentMethod: "card" | "upi";
  razorpayOrderId: string;
  expiresAt: number;
};

type VerifyPayrollPaymentInput = {
  draftId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const payrollPaymentDrafts = new Map<string, PayrollPaymentDraft>();

const cleanExpiredPayrollDrafts = () => {
  const now = Date.now();

  for (const [draftId, draft] of payrollPaymentDrafts.entries()) {
    if (draft.expiresAt <= now) {
      payrollPaymentDrafts.delete(draftId);
    }
  }
};

const getRequesterRestaurantId = async (requesterId: string) => {
  const user = await User.findById(requesterId).select("restaurantId");
  return user?.restaurantId ?? null;
};

export const generatePayrollService = async (
  employeeId: string,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const employee = await Employee.findOne({
    _id: employeeId,
    restaurantId,
    isActive: true,
  });
  if (!employee) {
    const error = new Error("Employee not found.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const existing = await Payroll.findOne({
    employeeId,
    month,
    year,
  });
  if (existing) {
    const error = new Error("Payroll already generated for this month.");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  return Payroll.create({
    employeeId,
    restaurantId,
    amount: employee.salary,
    month,
    year,
    status: "pending",
  });
};

export const generateMonthlyPayrollForAllService = async (
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const employees = await Employee.find({
    restaurantId,
    isActive: true,
  }).select("_id salary");

  const results = await Promise.allSettled(
    employees.map((employee) =>
      Payroll.create({
        employeeId: employee._id,
        restaurantId,
        amount: employee.salary,
        month,
        year,
        status: "pending",
      })
    )
  );

  const created = results.filter((r) => r.status === "fulfilled").length;
  const skipped = results.length - created;

  return { month, year, created, skipped };
};

export const getPayrollsService = async (
  requester: Requester,
  query: PayrollQuery
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const filter: Record<string, unknown> = { restaurantId };
  if (query.status) {
    filter.status = query.status;
  }
  if (query.employeeId) {
    filter.employeeId = query.employeeId;
  }
  if (query.month) {
    filter.month = Number(query.month);
  }
  if (query.year) {
    filter.year = Number(query.year);
  }

  return Payroll.find(filter)
    .populate({
      path: "employeeId",
      select: "userId salary role isActive",
      populate: { path: "userId", select: "name email" },
    })
    .sort({ createdAt: -1 });
};

export const getPayrollAnalyticsService = async (requester: Requester) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const byMonth = await Payroll.aggregate([
    { $match: { restaurantId, status: "paid" } },
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const perEmployee = await Payroll.aggregate([
    { $match: { restaurantId, status: "paid" } },
    {
      $group: {
        _id: "$employeeId",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { total: -1 } },
  ]);

  return { byMonth, perEmployee };
};

export const paySalaryService = async (
  payrollId: string,
  requester: Requester,
  paymentMethod: "cash" | "card" | "upi" = "upi"
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const payroll = await Payroll.findOne({ _id: payrollId, restaurantId });
  if (!payroll) {
    const error = new Error("Payroll not found.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }
  if (payroll.status === "paid") {
    const error = new Error("Payroll already paid.");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  payroll.status = "paid";
  payroll.paidAt = new Date();
  payroll.paymentMethod = paymentMethod;
  await payroll.save();

  await Expense.create({
    restaurantId,
    amount: payroll.amount,
    category: "salary",
    description: `Salary payment for ${payroll.month}/${payroll.year}`,
    paymentMethod,
    createdBy: requester.id,
  });

  return payroll;
};

export const createPayrollPaymentOrderService = async (
  payrollId: string,
  paymentMethod: "card" | "upi",
  requester: Requester
) => {
  if (paymentMethod !== "upi" && paymentMethod !== "card") {
    const error = new Error("Online payroll payment is supported only for UPI or card.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const payroll = await Payroll.findOne({ _id: payrollId, restaurantId });
  if (!payroll) {
    const error = new Error("Payroll not found.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  if (payroll.status === "paid") {
    const error = new Error("Payroll already paid.");
    (error as Error & { statusCode?: number }).statusCode = 409;
    throw error;
  }

  cleanExpiredPayrollDrafts();

  const draftId = crypto.randomUUID();
  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create({
    amount: Math.round(payroll.amount * 100),
    currency: "INR",
    receipt: `payroll_${draftId.slice(0, 20)}`,
  });

  payrollPaymentDrafts.set(draftId, {
    requesterId: requester.id,
    restaurantId: String(restaurantId),
    payrollId,
    paymentMethod,
    razorpayOrderId: order.id,
    expiresAt: Date.now() + 15 * 60 * 1000,
  });

  const razorpayKey = process.env.RAZORPAY_KEY;
  if (!razorpayKey) {
    const error = new Error("RAZORPAY_KEY is not defined in .env");
    (error as Error & { statusCode?: number }).statusCode = 500;
    throw error;
  }

  return {
    draftId,
    razorpayKey,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
  };
};

export const verifyPayrollPaymentService = async (
  payrollId: string,
  data: VerifyPayrollPaymentInput,
  requester: Requester
) => {
  cleanExpiredPayrollDrafts();

  const draft = payrollPaymentDrafts.get(data.draftId);
  if (!draft) {
    const error = new Error("Payment session expired. Please try again.");
    (error as Error & { statusCode?: number }).statusCode = 410;
    throw error;
  }

  if (draft.requesterId !== requester.id) {
    const error = new Error("Unauthorized payment session.");
    (error as Error & { statusCode?: number }).statusCode = 403;
    throw error;
  }

  if (draft.payrollId !== payrollId) {
    const error = new Error("Payroll payment mismatch.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  if (draft.razorpayOrderId !== data.razorpay_order_id) {
    const error = new Error("Razorpay order mismatch.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const secret = process.env.RAZORPAY_SECRET;
  if (!secret) {
    throw new Error("RAZORPAY_SECRET is not defined in .env");
  }

  const body = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expectedSignature !== data.razorpay_signature) {
    const error = new Error("Payment verification failed.");
    (error as Error & { statusCode?: number }).statusCode = 400;
    throw error;
  }

  const payroll = await paySalaryService(payrollId, requester, draft.paymentMethod);
  payrollPaymentDrafts.delete(data.draftId);

  return payroll;
};

export const generatePayslipPdfService = async (
  payrollId: string,
  requester: Requester
) => {
  const restaurantId = await getRequesterRestaurantId(requester.id);
  if (!restaurantId) {
    const error = new Error("Restaurant not found for user.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const payroll = await Payroll.findOne({ _id: payrollId, restaurantId })
    .populate({
      path: "employeeId",
      select: "userId salary role",
      populate: { path: "userId", select: "name email" },
    })
    .lean();

  if (!payroll) {
    const error = new Error("Payroll not found.");
    (error as Error & { statusCode?: number }).statusCode = 404;
    throw error;
  }

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => buffers.push(chunk));

  doc.fontSize(18).text("Payslip", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Employee: ${(payroll.employeeId as any).userId.name}`);
  doc.text(`Email: ${(payroll.employeeId as any).userId.email}`);
  doc.text(`Role: ${(payroll.employeeId as any).role}`);
  doc.moveDown();
  doc.text(`Month/Year: ${payroll.month}/${payroll.year}`);
  doc.text(`Amount: ${payroll.amount}`);
  doc.text(`Status: ${payroll.status}`);
  doc.text(`Paid At: ${payroll.paidAt ? new Date(payroll.paidAt).toDateString() : "-"}`);
  doc.text(`Payment Method: ${payroll.paymentMethod ?? "-"}`);
  doc.end();

  return await new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(buffers)));
  });
};
