import { useMemo, useState } from "react";
import {
  FiActivity,
  FiDollarSign,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
} from "react-icons/fi";
import { ClipLoader } from "react-spinners";
import { useAdminResource } from "../../customhooks/useAdminResource";
import useCurrentUser from "../../customhooks/useCurrentUser";
import { getDashboardSummary } from "../../services/adminService";

const ManagerDashboard = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const [refreshKey, setRefreshKey] = useState(0);

  const staticRange = useMemo(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);

    return {
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    };
  }, []);

  const hasAssignedRestaurant = Boolean(user?.restaurantId);

  const {
    data: dashboard,
    loading,
    error,
  } = useAdminResource(
    () => {
      if (!hasAssignedRestaurant) {
        return Promise.resolve(null);
      }

      return getDashboardSummary(staticRange);
    },
    [refreshKey, staticRange.startDate, staticRange.endDate, hasAssignedRestaurant]
  );

  const isLoadingDashboard = loading || userLoading;
  const revenueSeries = dashboard?.revenueTrend ?? [];
  const expenseSeries = dashboard?.expenseTrend ?? [];

  const maxTrendValue = Math.max(
    ...revenueSeries.map((point) => point.total),
    ...expenseSeries.map((point) => point.total),
    1
  );

  const revenueKpi = dashboard?.kpis.find((kpi) => kpi.label === "Revenue")?.value ?? "₹0";
  const ordersKpi = dashboard?.kpis.find((kpi) => kpi.label === "Orders")?.value ?? "0";
  const profitKpi = dashboard?.kpis.find((kpi) => kpi.label === "Profit")?.value ?? "₹0";
  const stockRiskKpi = dashboard?.kpis.find((kpi) => kpi.label === "Stock Risk")?.value ?? "0";

  if (!userLoading && !hasAssignedRestaurant) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 text-[#1D2A20]">
        <section className="rounded-xl border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[#9B3F2C]">Access Restricted</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#2A241B]">
            Manager Is Not Assigned To Any Restaurant
          </h1>
          <p className="mt-2 text-sm text-[#6B5C46]">
            Ask admin to assign a restaurant. After assignment, your dashboard and role
            actions will activate automatically.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-[#1D2A20]">
        <section className="rounded-xl border border-[#E4DCCF] bg-white/90 p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-[#8A7A62]">
                Manager Workspace
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-[#2A241B] sm:text-3xl">
                Welcome, {user?.name ?? "Manager"}
              </h1>
              <p className="mt-1 text-sm text-[#6B5C46]">
                Track operations, orders, and profitability in one place.
              </p>
            </div>

            <button
              onClick={() => setRefreshKey((value) => value + 1)}
              disabled={isLoadingDashboard || !hasAssignedRestaurant}
              className="inline-flex items-center gap-2 rounded-lg border border-[#E0D5C3] bg-white px-4 py-2 text-sm font-semibold text-[#2A241B] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
              {isLoadingDashboard ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="mt-4 rounded-lg border border-[#E4DCCF] bg-[#F9F4EC] px-4 py-3 text-sm text-[#2A241B]">
            Last 30 days: {staticRange.startDate} to {staticRange.endDate}
          </div>

          {isLoadingDashboard && !dashboard && (
            <div className="mt-5 rounded-lg border border-[#E4DCCF] bg-white/60 p-5">
              <div className="flex items-center justify-center py-4">
                <ClipLoader color="#6B5C46" loading size={20} />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-4 text-sm text-[#9B3F2C]">
              {error}
            </div>
          )}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Revenue</p>
              <FiTrendingUp className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{revenueKpi}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Total revenue in current range</p>
          </article>

          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Orders</p>
              <FiShoppingBag className="h-4 w-4 text-[#2A241B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{ordersKpi}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">All processed orders</p>
          </article>

          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Profit</p>
              <FiDollarSign className="h-4 w-4 text-[#3F6F5B]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{profitKpi}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Net business performance</p>
          </article>

          <article className="rounded-lg border border-[#E4DCCF] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">Stock Risk</p>
              <FiPackage className="h-4 w-4 text-[#B85C38]" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-[#2A241B]">{stockRiskKpi}</p>
            <p className="mt-1 text-xs text-[#6B5C46]">Items below threshold</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2A241B]">Revenue vs Expenses</h3>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
              Monthly trend
            </p>

            <div className="mt-5 space-y-4">
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
                <p className="text-sm text-[#8A7A62]">No trend data available.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-lg border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
              <p className="text-xs uppercase tracking-[0.28em] text-[#E4C992]">AI Insights</p>
              <div className="mt-3 space-y-3 text-sm">
                {(dashboard?.insights ?? []).map((insight) => (
                  <div key={insight._id ?? insight.message}>
                    <p className="font-semibold capitalize">{insight.title ?? insight.type}</p>
                    <p className="mt-1 text-[#E9DDC9]">{insight.message}</p>
                  </div>
                ))}
                {!dashboard?.insights.length && (
                  <p className="text-[#E9DDC9]">No insights available.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.25em] text-[#8A7A62]">Quick Actions</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm text-[#2A241B]">
                  Review POS order completion and pending volume.
                </div>
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm text-[#2A241B]">
                  Monitor online order fulfillment and payment health.
                </div>
                <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm text-[#2A241B]">
                  Track low-stock risk and inventory thresholds.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2A241B]">Top Selling Items</h3>
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
                <p className="text-sm text-[#8A7A62]">No top dish data available.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2A241B]">Inventory Alerts</h3>
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
                <p className="text-sm text-[#8A7A62]">No low stock alerts.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#2A241B]">Notifications</h3>
            <div className="mt-4 space-y-3">
              {(dashboard?.notifications ?? []).map((notification) => (
                <div
                  key={`${notification.source}-${notification.message}`}
                  className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.1em] text-[#8A7A62]">
                    <span>{notification.type}</span>
                    <span>{notification.source}</span>
                  </div>
                  <p className="mt-1 text-[#6B5C46]">{notification.message}</p>
                </div>
              ))}
              {!dashboard?.notifications.length && (
                <p className="text-sm text-[#8A7A62]">No notifications available.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#6B5C46]">
            <span className="inline-flex items-center gap-2 font-semibold text-[#2B6B4B]">
              <FiActivity className="h-4 w-4" />
              Live operational monitoring enabled
            </span>
            <span>Role: {user?.role ?? "manager"}</span>
          </div>
        </section>
    </div>
  );
};

export default ManagerDashboard;
