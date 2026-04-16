import { useState } from "react";
import { FiLoader, FiPlusCircle } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  createPayrollPaymentOrder,
  generateMonthlyPayroll,
  getPayrollAnalytics,
  getPayrolls,
  payPayroll,
  verifyPayrollPayment,
} from "../../services/adminService";

const paymentOptions = ["upi", "card", "cash"] as const;

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

const PayrollPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [creatingPayroll, setCreatingPayroll] = useState(false);
  const [payingPayrollId, setPayingPayrollId] = useState<string | null>(null);
  const [paymentMethodById, setPaymentMethodById] = useState<
    Record<string, "cash" | "card" | "upi">
  >({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const { data: payrolls, loading, error } = useAdminResource(getPayrolls, [refreshKey]);
  const { data: analytics } = useAdminResource(getPayrollAnalytics, [refreshKey]);
  const pending = (payrolls ?? []).filter((payroll) => payroll.status === "pending");

  const getPaymentMethod = (payrollId: string) =>
    paymentMethodById[payrollId] ?? "upi";

  const handleCreatePayroll = async () => {
    setCreatingPayroll(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const result = await generateMonthlyPayroll();
      setCreateSuccess(
        `Payroll generated for ${result.month}/${result.year}. Created: ${result.created}, Skipped: ${result.skipped}.`
      );
      setRefreshKey((key) => key + 1);
    } catch (generationError) {
      setCreateError(
        generationError instanceof Error
          ? generationError.message
          : "Payroll could not be generated."
      );
    } finally {
      setCreatingPayroll(false);
    }
  };

  const handlePayPayroll = async (payrollId: string) => {
    setPayingPayrollId(payrollId);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const method = getPaymentMethod(payrollId);

      if (method === "cash") {
        await payPayroll(payrollId, method);
      } else {
        const order = await createPayrollPaymentOrder(payrollId, method);
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
            name: "Payroll Payment",
            description: `Salary for payroll ${payrollId.slice(-6)}`,
            order_id: order.orderId,
            handler: async (paymentResponse) => {
              try {
                await verifyPayrollPayment(payrollId, {
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

      setCreateSuccess("Payroll payment marked as successful.");
      setRefreshKey((key) => key + 1);
    } catch (paymentError) {
      setCreateError(
        paymentError instanceof Error
          ? paymentError.message
          : "Payroll payment could not be completed."
      );
    } finally {
      setPayingPayrollId(null);
    }
  };

  return (
    <SectionShell title="Payroll" subtitle="Compensation">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Monthly Payroll
            </h4>
            <button
              onClick={handleCreatePayroll}
              disabled={creatingPayroll}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F1E8] disabled:opacity-60"
            >
              {creatingPayroll ? (
                <>
                  <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Creating
                </>
              ) : (
                <>
                  <FiPlusCircle className="h-4 w-4" aria-hidden="true" />
                  Create Payroll
                </>
              )}
            </button>
          </div>
          {createError && <p className="mt-3 text-sm text-[#9B3F2C]">{createError}</p>}
          {createSuccess && <p className="mt-3 text-sm text-[#3F6F5B]">{createSuccess}</p>}
          <div className="mt-4 overflow-x-auto">
            <ResourceState
              loading={loading}
              error={error}
              empty={!payrolls?.length}
              emptyMessage="No payroll records found."
            />
            {!!payrolls?.length && (
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                  <tr>
                    <th className="py-3 pr-4">Employee</th>
                    <th className="py-3 pr-4">Period</th>
                    <th className="py-3 pr-4">Amount</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEE4D5] text-[#2A241B]">
                  {payrolls.map((payroll) => (
                    <tr key={payroll._id}>
                      <td className="py-3 pr-4 font-medium">
                        {payroll.employeeId?.userId?.name ?? "-"}
                      </td>
                      <td className="py-3 pr-4">
                        {payroll.month}/{payroll.year}
                      </td>
                      <td className="py-3 pr-4">₹{payroll.amount}</td>
                      <td className="py-3 pr-4 capitalize">{payroll.status}</td>
                      <td className="py-3">
                        {payroll.status === "pending" ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={getPaymentMethod(payroll._id)}
                              onChange={(event) =>
                                setPaymentMethodById((prev) => ({
                                  ...prev,
                                  [payroll._id]: event.target.value as
                                    | "cash"
                                    | "card"
                                    | "upi",
                                }))
                              }
                              className="rounded-md border border-[#E0D5C3] bg-white px-2 py-1 text-xs"
                            >
                              {paymentOptions.map((method) => (
                                <option key={method} value={method}>
                                  {method.toUpperCase()}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handlePayPayroll(payroll._id)}
                              disabled={payingPayrollId === payroll._id}
                              className="inline-flex items-center gap-1 rounded-md bg-[#2A241B] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#F7F1E8] disabled:opacity-60"
                            >
                              {payingPayrollId === payroll._id ? (
                                <>
                                  <FiLoader
                                    className="h-3.5 w-3.5 animate-spin"
                                    aria-hidden="true"
                                  />
                                  Paying
                                </>
                              ) : (
                                "Pay"
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[#3F6F5B]">
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">Run Summary</h4>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[#6B5C46]">Pending approvals</span>
              <span className="font-medium text-[#2A241B]">{pending.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5C46]">Paid months</span>
              <span className="font-medium text-[#2A241B]">
                {analytics?.byMonth.length ?? 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B5C46]">Paid total</span>
              <span className="font-medium text-[#2A241B]">
                ₹
                {(analytics?.byMonth ?? []).reduce(
                  (total, item) => total + item.total,
                  0
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default PayrollPage;
