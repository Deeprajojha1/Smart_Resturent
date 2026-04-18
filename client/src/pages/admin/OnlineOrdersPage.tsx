import { useMemo, useState } from "react";
import { FiLoader, FiSave } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  getMonthlyOnlineOrderRecord,
  getOnlineOrders,
  updateOnlineOrderStatus,
  type OnlineOrder,
} from "../../services/adminService";

const statuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"];

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

const OnlineOrdersPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [refreshKey, setRefreshKey] = useState(0);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [statusByOrderId, setStatusByOrderId] = useState<Record<string, OnlineOrder["status"]>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");

  const selectedMonth = Number(month);
  const selectedYear = Number(year);
  const startDate = new Date(selectedYear, selectedMonth - 1, 1);
  const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);

  const { data: orders, loading, error } = useAdminResource(
    () =>
      getOnlineOrders({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    [month, year, refreshKey]
  );

  const {
    data: monthlyRecord,
    loading: reportLoading,
    error: reportError,
  } = useAdminResource(
    () => getMonthlyOnlineOrderRecord({ month, year }),
    [month, year, refreshKey]
  );

  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => String(currentYear - index));
  }, []);

  const dailyRevenueBars = useMemo(() => {
    const points = monthlyRecord?.dailyBreakdown ?? [];
    const getPointValue = (point: (typeof points)[number]) =>
      chartMetric === "revenue" ? point.revenue : point.orders;

    const maxRevenue = Math.max(
      ...points.map((point) => getPointValue(point)),
      1
    );

    return points.map((point) => ({
      ...point,
      metricValue: getPointValue(point),
      heightPercent: Math.max(6, Math.round((getPointValue(point) / maxRevenue) * 100)),
    }));
  }, [chartMetric, monthlyRecord]);

  const handleUpdateStatus = async (orderId: string) => {
    const status = statusByOrderId[orderId];
    if (!status) {
      setActionError("Please select a status first.");
      return;
    }

    setSavingOrderId(orderId);
    setActionError(null);
    setActionSuccess(null);

    try {
      await updateOnlineOrderStatus(orderId, status);
      setActionSuccess("Order status updated successfully.");
      setRefreshKey((key) => key + 1);
    } catch (updateError) {
      setActionError(
        updateError instanceof Error
          ? updateError.message
          : "Order status could not be updated."
      );
    } finally {
      setSavingOrderId(null);
    }
  };

  return (
    <SectionShell title="Online Orders" subtitle="Delivery & Pickup">
      <div className="space-y-6">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Monthly Report
            </h4>

            <div className="flex items-center gap-2">
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="rounded-md border border-[#E0D5C3] bg-white px-3 py-1.5 text-sm text-[#2A241B]"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <select
                value={year}
                onChange={(event) => setYear(event.target.value)}
                className="rounded-md border border-[#E0D5C3] bg-white px-3 py-1.5 text-sm text-[#2A241B]"
              >
                {availableYears.map((yearValue) => (
                  <option key={yearValue} value={yearValue}>
                    {yearValue}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ResourceState
            loading={reportLoading}
            error={reportError}
            empty={!monthlyRecord}
            emptyMessage="No monthly report available."
          />

          {!!monthlyRecord && (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8A7A62]">Total Orders</p>
                  <p className="mt-2 text-xl font-semibold text-[#2A241B]">{monthlyRecord.totalOrders}</p>
                </div>
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8A7A62]">Revenue</p>
                  <p className="mt-2 text-xl font-semibold text-[#2A241B]">₹{monthlyRecord.totalRevenue}</p>
                </div>
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8A7A62]">Avg Order Value</p>
                  <p className="mt-2 text-xl font-semibold text-[#2A241B]">₹{monthlyRecord.avgOrderValue}</p>
                </div>
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-[#8A7A62]">Cancelled</p>
                  <p className="mt-2 text-xl font-semibold text-[#2A241B]">{monthlyRecord.cancelledOrders}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-6 xl:grid-cols-2">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B5C46]">
                      Daily Chart
                    </h5>
                    <div className="inline-flex rounded-md border border-[#E0D5C3] bg-white p-1">
                      <button
                        onClick={() => setChartMetric("revenue")}
                        className={`rounded px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                          chartMetric === "revenue"
                            ? "bg-[#2A241B] text-[#F7F1E8]"
                            : "text-[#6B5C46]"
                        }`}
                      >
                        Revenue
                      </button>
                      <button
                        onClick={() => setChartMetric("orders")}
                        className={`rounded px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${
                          chartMetric === "orders"
                            ? "bg-[#2A241B] text-[#F7F1E8]"
                            : "text-[#6B5C46]"
                        }`}
                      >
                        Orders
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg border border-[#EEE4D5] bg-white p-3">
                    {!!dailyRevenueBars.length && (
                      <div className="flex h-40 items-end gap-1.5 overflow-x-auto">
                        {dailyRevenueBars.map((point) => (
                          <div
                            key={`rev-${point.day}`}
                            className="group flex min-w-7 flex-col items-center justify-end"
                            title={`Day ${point.day}: ${point.metricValue} ${
                              chartMetric === "revenue" ? "revenue" : "orders"
                            }`}
                          >
                            <div
                              className="w-full rounded-t bg-[#B85C38] transition-opacity group-hover:opacity-80"
                              style={{ height: `${point.heightPercent}%` }}
                            />
                            <span className="mt-1 text-[10px] text-[#8A7A62]">
                              {point.day}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!dailyRevenueBars.length && (
                      <p className="text-sm text-[#8A7A62]">No chart data for this month.</p>
                    )}
                  </div>

                  <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B5C46]">
                    Daily Breakdown
                  </h5>
                  <div className="mt-3 space-y-2">
                    {monthlyRecord.dailyBreakdown.slice(0, 10).map((point) => (
                      <div
                        key={point.day}
                        className="flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-sm"
                      >
                        <span className="text-[#2A241B]">Day {point.day}</span>
                        <span className="text-[#8A7A62]">
                          {point.orders} orders / ₹{point.revenue}
                        </span>
                      </div>
                    ))}
                    {!monthlyRecord.dailyBreakdown.length && (
                      <p className="text-sm text-[#8A7A62]">No day-wise data.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B5C46]">
                    Top Items
                  </h5>
                  <div className="mt-3 space-y-2">
                    {monthlyRecord.topItems.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-sm"
                      >
                        <span className="font-medium text-[#2A241B]">{item.name}</span>
                        <span className="text-[#8A7A62]">
                          {item.quantity} sold / ₹{item.revenue}
                        </span>
                      </div>
                    ))}
                    {!monthlyRecord.topItems.length && (
                      <p className="text-sm text-[#8A7A62]">No top items for this month.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Order Pipeline
          </h4>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
            {orders?.length ?? 0} orders
          </span>
        </div>
        {actionError && <p className="mt-3 text-sm text-[#9B3F2C]">{actionError}</p>}
        {actionSuccess && (
          <p className="mt-3 text-sm text-[#3F6F5B]">{actionSuccess}</p>
        )}
        <div className="mt-4 grid gap-4 xl:grid-cols-5">
          <ResourceState
            loading={loading}
            error={error}
            empty={!orders?.length}
            emptyMessage="No online orders found."
          />
          {statuses.map((status) => (
            <div key={status} className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3">
              <h5 className="text-sm font-semibold capitalize text-[#2A241B]">
                {status}
              </h5>
              <div className="mt-3 space-y-3">
                {(orders ?? [])
                  .filter((order) => order.status === status)
                  .map((order) => (
                    <div key={order._id} className="rounded-lg bg-white p-3 text-sm shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#2A241B]">
                          #{order._id.slice(-6)}
                        </span>
                        <span className="text-[#8A7A62]">₹{order.totalAmount}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#6B5C46]">
                        {order.customerId?.name ?? "Guest customer"}
                      </p>
                      <p className="mt-1 text-xs text-[#8A7A62]">
                        {order.paymentMethod ?? "payment"} /{" "}
                        {order.paymentStatus ?? "pending"}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <select
                          value={statusByOrderId[order._id] ?? order.status}
                          onChange={(event) =>
                            setStatusByOrderId((prev) => ({
                              ...prev,
                              [order._id]: event.target.value as OnlineOrder["status"],
                            }))
                          }
                          className="w-full rounded-md border border-[#E0D5C3] bg-white px-2 py-1 text-xs text-[#2A241B]"
                        >
                          {statuses.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleUpdateStatus(order._id)}
                          disabled={savingOrderId === order._id}
                          className="inline-flex items-center gap-1 rounded-md bg-[#2A241B] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#F7F1E8] disabled:opacity-60"
                        >
                          {savingOrderId === order._id ? (
                            <>
                              <FiLoader className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                              Saving
                            </>
                          ) : (
                            <>
                              <FiSave className="h-3.5 w-3.5" aria-hidden="true" />
                              Save
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </SectionShell>
  );
};

export default OnlineOrdersPage;
