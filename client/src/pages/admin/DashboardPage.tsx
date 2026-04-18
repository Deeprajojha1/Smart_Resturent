import { useEffect, useMemo } from "react";
import {
  FiActivity,
  FiDollarSign,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import SectionShell from "../../components/admin/SectionShell";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardSummary } from "../../store/adminSlice";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { dashboard, status, error } = useAppSelector((state) => state.admin);
  const staticRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }, []);

  useEffect(() => {
    dispatch(fetchDashboardSummary(staticRange));
  }, [dispatch, staticRange]);

  const profitValue = useMemo(() => {
    const profitKpi = (dashboard?.kpis ?? []).find((item) => item.label === "Profit");
    return profitKpi?.value ?? "₹0";
  }, [dashboard?.kpis]);

  const totalInventoryAlerts = dashboard?.inventoryAlerts.length ?? 0;
  const totalOnlineOrders = dashboard?.onlineOrders.length ?? 0;

  const isLoading = status === "loading";

  const refreshWithCurrentFilters = () => {
    dispatch(fetchDashboardSummary(staticRange));
  };

  const revenueSeries = dashboard?.revenueTrend ?? [];
  const expenseSeries = dashboard?.expenseTrend ?? [];
  const latestRevenue = revenueSeries.at(-1)?.total ?? 0;
  const latestExpense = expenseSeries.at(-1)?.total ?? 0;
  const grossMargin = latestRevenue
    ? Number((((latestRevenue - latestExpense) / latestRevenue) * 100).toFixed(1))
    : 0;

  const maxTrendValue = Math.max(
    ...revenueSeries.map((point) => point.total),
    ...expenseSeries.map((point) => point.total),
    1
  );

  return (
    <SectionShell title="Dashboard" subtitle="Command Center">
      <div className="space-y-8">
        <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8A7A62]">
                Executive Snapshot
              </p>
              <h3 className="mt-1 text-xl font-semibold text-[#2A241B] sm:text-2xl">
                Business Health Overview
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshWithCurrentFilters}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-md border border-[#E0D5C3] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#2A241B] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                {isLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-[#E4DCCF] bg-[#F9F4EC] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A7A62]">
              Fixed Date Range
            </p>
            <p className="mt-1 text-sm text-[#2A241B]">
              {staticRange.startDate} to {staticRange.endDate} (Last 30 Days)
            </p>
          </div>

          {status === "loading" && !dashboard && (
            <div className="mt-5 rounded-lg border border-[#E4DCCF] bg-white/60 p-5">
              <div className="flex items-center justify-center py-4">
                <ClipLoader color="#6B5C46" loading size={20} />
              </div>
            </div>
          )}

          {status === "failed" && (
            <div className="mt-5 rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-5 text-sm text-[#9B3F2C]">
              {error ?? "Dashboard data could not be loaded."}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Revenue</p>
              <FiTrendingUp className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">
              {dashboard?.kpis.find((kpi) => kpi.label === "Revenue")?.value ?? "₹0"}
            </p>
            <p className="mt-1 text-xs text-[#6B5C46]">Latest total revenue</p>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Orders</p>
              <FiShoppingBag className="h-4 w-4 text-[#2A241B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">
              {dashboard?.kpis.find((kpi) => kpi.label === "Orders")?.value ?? "0"}
            </p>
            <p className="mt-1 text-xs text-[#6B5C46]">Total processed orders</p>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Profit</p>
              <FiDollarSign className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{profitValue}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Net performance snapshot</p>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Ops Risk</p>
              <FiPackage className="h-4 w-4 text-[#B85C38]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{totalInventoryAlerts}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Low-stock flagged items</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[#8A7A62]">
                  Performance Trend
                </p>
                <h4 className="text-xl font-semibold text-[#2A241B]">Revenue vs Expenses</h4>
              </div>
              <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
                Margin {grossMargin}%
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {revenueSeries.slice(-8).map((point) => {
                const expense = expenseSeries.find(
                  (item) =>
                    item._id.year === point._id.year &&
                    item._id.month === point._id.month
                );

                const revenueWidth = (point.total / maxTrendValue) * 100;
                const expenseWidth = ((expense?.total ?? 0) / maxTrendValue) * 100;

                return (
                  <div key={`${point._id.year}-${point._id.month}`}>
                    <div className="mb-2 flex items-center justify-between text-xs text-[#6B5C46]">
                      <span>
                        {point._id.month}/{point._id.year}
                      </span>
                      <span>{point.orders} orders</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 rounded bg-[#E4DCCF]">
                        <div
                          className="h-3 rounded bg-[#3F6F5B]"
                          style={{ width: `${revenueWidth}%` }}
                        />
                      </div>
                      <div className="h-3 rounded bg-[#E4DCCF]">
                        <div
                          className="h-3 rounded bg-[#B85C38]"
                          style={{ width: `${expenseWidth}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {!revenueSeries.length && (
                <p className="text-sm text-[#8A7A62]">No trend data yet.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
              <p className="text-xs uppercase tracking-[0.3em] text-[#E4C992]">AI Insights</p>
              <div className="mt-4 space-y-3">
                {(dashboard?.insights ?? []).map((insight) => (
                  <div key={insight._id ?? insight.message}>
                    <h4 className="text-sm font-semibold capitalize">{insight.title ?? insight.type}</h4>
                    <p className="mt-1 text-sm text-[#E9DDC9]">{insight.message}</p>
                  </div>
                ))}
                {!dashboard?.insights.length && (
                  <p className="text-sm text-[#E9DDC9]">No AI insights yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">Operational Pulse</p>
              <div className="mt-3 space-y-2 text-sm text-[#6B5C46]">
                <div className="flex items-center justify-between">
                  <span>Recent online orders</span>
                  <span className="font-semibold text-[#2A241B]">{totalOnlineOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Low stock items</span>
                  <span className="font-semibold text-[#2A241B]">{totalInventoryAlerts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>System status</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-[#2B6B4B]">
                    <FiActivity className="h-3.5 w-3.5" />
                    Stable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#2A241B]">Top Selling Items</h4>
            <div className="mt-4 space-y-3">
              {(dashboard?.topDishes ?? []).map((dish) => (
                <div
                  key={dish.name}
                  className="flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm"
                >
                  <span className="font-medium text-[#2A241B]">{dish.name}</span>
                  <span className="text-[#8A7A62]">{dish.totalSold} sold</span>
                </div>
              ))}
              {!dashboard?.topDishes.length && (
                <p className="text-sm text-[#8A7A62]">No sales data yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#2A241B]">Inventory Alerts</h4>
            <div className="mt-4 space-y-3">
              {(dashboard?.inventoryAlerts ?? []).map((item) => (
                <div
                  key={item.itemName}
                  className="rounded-lg border border-[#F1D8C7] bg-white px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#2A241B]">{item.itemName}</span>
                    <span className="rounded-full bg-[#F5D0C4] px-2 py-1 text-xs font-semibold text-[#9B3F2C]">
                      {item.quantity} {item.unit ?? ""}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8A7A62]">
                    Threshold: {item.lowStockThreshold ?? 0}
                  </p>
                </div>
              ))}
              {!dashboard?.inventoryAlerts.length && (
                <p className="text-sm text-[#8A7A62]">No low stock items.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#2A241B]">Recent Notifications</h4>
            <div className="mt-4 space-y-3">
              {(dashboard?.notifications ?? []).map((notification) => (
                <div
                  key={`${notification.source}-${notification.message}`}
                  className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[#8A7A62]">
                    <span className="truncate">{notification.type}</span>
                    <span className="truncate">{notification.source}</span>
                  </div>
                  <p className="mt-2 text-[#6B5C46]">{notification.message}</p>
                </div>
              ))}
              {!dashboard?.notifications.length && (
                <p className="text-sm text-[#8A7A62]">No notifications.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </SectionShell>
  );
};

export default DashboardPage;
