import { useEffect, useMemo, useState } from "react";
import { FiPlusCircle } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  createExpensePaymentOrder,
  createExpense,
  getExpenseAnalytics,
  getExpenses,
  getMonthlyExpenses,
  verifyExpensePayment,
  type ExpenseInput,
  type OnlineExpenseInput,
} from "../../services/adminService";

type RazorpayPaymentSuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", handler: () => void) => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayPaymentSuccess) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

type RazorpayWindow = Window & {
  Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
};

const loadRazorpayScript = async () => {
  const razorpayWindow = window as RazorpayWindow;
  if (razorpayWindow.Razorpay) {
    return true;
  }

  return await new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector(
      'script[data-razorpay="checkout"]'
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });
      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.setAttribute("data-razorpay", "checkout");
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const monthOptions = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const expenseCategoryOptions: Array<ExpenseInput["category"]> = [
  "rent",
  "raw_material",
  "utilities",
  "maintenance",
  "other",
];

const paymentMethodOptions: Array<NonNullable<ExpenseInput["paymentMethod"]>> = [
  "cash",
  "card",
  "upi",
];

const ExpensesPage = () => {
  const itemsPerPage = 5;
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: expenses, loading, error } = useAdminResource(getExpenses, [refreshKey]);
  const { data: analytics } = useAdminResource(getExpenseAnalytics, [refreshKey]);
  const { data: monthly } = useAdminResource(getMonthlyExpenses, [refreshKey]);
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    amount: "",
    category: "other" as ExpenseInput["category"],
    paymentMethod: "cash" as NonNullable<ExpenseInput["paymentMethod"]>,
    vendor: "",
    description: "",
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      amount: "",
      category: "other",
      paymentMethod: "cash",
      vendor: "",
      description: "",
    });
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();

    (expenses ?? []).forEach((expense) => {
      if (!expense.createdAt) {
        return;
      }

      const createdAt = new Date(expense.createdAt);
      if (!Number.isNaN(createdAt.getTime())) {
        years.add(String(createdAt.getFullYear()));
      }
    });

    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return (expenses ?? []).filter((expense) => {
      if (!expense.createdAt) {
        return monthFilter === "all" && yearFilter === "all";
      }

      const createdAt = new Date(expense.createdAt);
      if (Number.isNaN(createdAt.getTime())) {
        return monthFilter === "all" && yearFilter === "all";
      }

      const expenseMonth = String(createdAt.getMonth() + 1);
      const expenseYear = String(createdAt.getFullYear());
      const matchesMonth = monthFilter === "all" || expenseMonth === monthFilter;
      const matchesYear = yearFilter === "all" || expenseYear === yearFilter;

      return matchesMonth && matchesYear;
    });
  }, [expenses, monthFilter, yearFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / itemsPerPage));

  const paginatedExpenses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExpenses, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [monthFilter, yearFilter, refreshKey]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleCreateExpense = async () => {
    const amount = Number(form.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setCreateError("Please enter a valid amount greater than 0.");
      return;
    }

    setCreating(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const payload: ExpenseInput = {
        amount,
        category: form.category,
        paymentMethod: form.paymentMethod,
        vendor: form.vendor.trim() || undefined,
        description: form.description.trim() || undefined,
      };

      if (form.paymentMethod === "cash") {
        await createExpense(payload);
      } else {
        const order = await createExpensePaymentOrder(payload as OnlineExpenseInput);
        const scriptLoaded = await loadRazorpayScript();

        if (!scriptLoaded) {
          throw new Error("Razorpay checkout could not be loaded.");
        }

        const RazorpayConstructor = (window as RazorpayWindow).Razorpay;
        if (!RazorpayConstructor) {
          throw new Error("Razorpay checkout is unavailable.");
        }

        await new Promise<void>((resolve, reject) => {
          const razorpay = new RazorpayConstructor({
            key: order.razorpayKey,
            amount: order.amount,
            currency: order.currency,
            name: "Restaurant Expense",
            description: `${form.category.replace("_", " ")} expense`,
            order_id: order.orderId,
            handler: async (paymentResponse) => {
              try {
                await verifyExpensePayment({
                  draftId: order.draftId,
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                });
                resolve();
              } catch (verificationError) {
                reject(verificationError);
              }
            },
            modal: {
              ondismiss: () => reject(new Error("Payment cancelled by user.")),
            },
          });

          razorpay.on("payment.failed", () => {
            reject(new Error("Payment failed. Please try again."));
          });

          razorpay.open();
        });
      }

      resetForm();
      setCreateSuccess("Expense created successfully.");
      setRefreshKey((key) => key + 1);
    } catch (creationError) {
      setCreateError(
        creationError instanceof Error
          ? creationError.message
          : "Expense could not be created."
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <SectionShell title="Expenses" subtitle="Operational Spend">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B5C46]">
                Add Expense
              </h5>
              <FiPlusCircle className="h-4 w-4 text-[#6B5C46]" aria-hidden="true" />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-[#8A7A62]">
                  Amount
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, amount: event.target.value }))
                  }
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                />
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-[#8A7A62]">
                  Category
                </span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      category: event.target.value as ExpenseInput["category"],
                    }))
                  }
                  className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                >
                  {expenseCategoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-[#8A7A62]">
                  Salary expense is auto-added from Payroll payment. Use Payroll page to process salaries.
                </p>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-[#8A7A62]">
                  Payment Method
                </span>
                <select
                  value={form.paymentMethod}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      paymentMethod: event.target.value as NonNullable<
                        ExpenseInput["paymentMethod"]
                      >,
                    }))
                  }
                  className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                >
                  {paymentMethodOptions.map((method) => (
                    <option key={method} value={method}>
                      {method.toUpperCase()}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm">
                <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-[#8A7A62]">
                  Vendor
                </span>
                <input
                  type="text"
                  value={form.vendor}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, vendor: event.target.value }))
                  }
                  placeholder="Optional vendor"
                  className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                />
              </label>

              <label className="block text-sm md:col-span-2">
                <span className="mb-1 block text-xs uppercase tracking-[0.15em] text-[#8A7A62]">
                  Description
                </span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  rows={2}
                  placeholder="Optional description"
                  className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
                />
              </label>
            </div>

            {createError && <p className="mt-3 text-sm text-[#9B3F2C]">{createError}</p>}
            {createSuccess && <p className="mt-3 text-sm text-[#3F6F5B]">{createSuccess}</p>}

            <div className="mt-3 flex justify-end">
              <button
                onClick={handleCreateExpense}
                disabled={creating}
                className="rounded-lg bg-[#2A241B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F1E8] disabled:opacity-60"
              >
                {creating ? "Creating" : "Create Expense"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Expense Ledger
            </h4>
            <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
              {filteredExpenses.length} / {expenses?.length ?? 0} entries
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="block text-sm">
              <span className="sr-only">Filter by month</span>
              <select
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
                className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
              >
                <option value="all">All months</option>
                {monthOptions.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="sr-only">Filter by year</span>
              <select
                value={yearFilter}
                onChange={(event) => setYearFilter(event.target.value)}
                className="w-full rounded-lg border border-[#E0D5C3] bg-white px-3 py-2 text-[#2A241B]"
              >
                <option value="all">All years</option>
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 space-y-3">
            <ResourceState
              loading={loading}
              error={error}
              empty={!filteredExpenses.length}
              emptyMessage={
                expenses?.length
                  ? "No expenses match selected month/year."
                  : "No expenses found."
              }
            />
            {paginatedExpenses.map((expense) => (
              <div
                key={expense._id}
                className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize text-[#2A241B]">
                    {expense.category.replace("_", " ")}
                  </span>
                  <span className="text-[#8A7A62]">₹{expense.amount}</span>
                </div>
                <p className="mt-2 text-[#6B5C46]">
                  {expense.description ?? expense.vendor ?? "No description"}
                </p>
                <div className="mt-3 rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-xs text-[#6B5C46]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Added by{" "}
                      <span className="font-semibold text-[#2A241B]">
                        {expense.createdBy?.name ?? "Unknown user"}
                      </span>
                    </span>
                    <span className="rounded-full bg-[#F7F1E8] px-2 py-1 font-semibold capitalize text-[#6B5C46]">
                      {expense.createdBy?.role ?? "unknown"}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span>{expense.createdBy?.email ?? "No email"}</span>
                    <span className="capitalize">
                      {expense.paymentMethod ?? "cash"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {!!filteredExpenses.length && (
              <div className="flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-sm text-[#6B5C46]">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage === 1}
                    className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages}
                    className="rounded-md border border-[#E0D5C3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              By Category
            </h4>
            <div className="mt-4 space-y-3">
              {(analytics ?? []).map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span className="capitalize text-[#6B5C46]">
                    {item._id.replace("_", " ")}
                  </span>
                  <span className="font-medium text-[#2A241B]">₹{item.total}</span>
                </div>
              ))}
              {!analytics?.length && (
                <p className="text-sm text-[#8A7A62]">No category data.</p>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Monthly Spend
            </h4>
            <div className="mt-4 space-y-3">
              {(monthly ?? []).map((item) => (
                <div key={item._id.month} className="flex justify-between text-sm">
                  <span className="text-[#6B5C46]">Month {item._id.month}</span>
                  <span className="font-medium text-[#2A241B]">₹{item.total}</span>
                </div>
              ))}
              {!monthly?.length && (
                <p className="text-sm text-[#8A7A62]">No monthly data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default ExpensesPage;
