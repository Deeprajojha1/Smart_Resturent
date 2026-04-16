import { useEffect } from "react";
import { ClipLoader } from "react-spinners";
import SectionShell from "../../components/admin/SectionShell";
import StatCard from "../../components/admin/StatCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardSummary } from "../../store/adminSlice";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { dashboard, status, error } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardSummary(undefined));
  }, [dispatch]);

  return (
    <SectionShell title="Dashboard" subtitle="Command Center">
      <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {(dashboard?.kpis ?? []).map((kpi) => (
          <StatCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            delta={kpi.delta}
            trend={kpi.trend}
          />
        ))}
        {status === "loading" && !dashboard && (
          <div className="rounded-lg border border-[#E4DCCF] bg-white/60 p-5">
            <div className="flex items-center justify-center py-4">
              <ClipLoader color="#6B5C46" loading size={20} />
            </div>
          </div>
        )}
        {status === "failed" && (
          <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-5 text-sm text-[#9B3F2C]">
            {error ?? "Dashboard data could not be loaded."}
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">
                Performance Trend
              </p>
              <h3 className="text-xl font-semibold text-[#2A241B]">
                Revenue vs Expenses
              </h3>
            </div>
            <span className="rounded-full border border-[#E4DCCF] bg-[#F7F1E8] px-3 py-1 text-xs text-[#6B5C46]">
              Monthly
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {(dashboard?.revenueTrend ?? []).slice(-6).map((point) => {
              const expense = dashboard?.expenseTrend.find(
                (item) =>
                  item._id.year === point._id.year &&
                  item._id.month === point._id.month
              );
              const maxValue = Math.max(
                dashboard?.monthlyRevenue ?? 0,
                dashboard?.monthlyExpenses ?? 0,
                point.total,
                expense?.total ?? 0,
                1
              );

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
                        style={{ width: `${(point.total / maxValue) * 100}%` }}
                      />
                    </div>
                    <div className="h-3 rounded bg-[#E4DCCF]">
                      <div
                        className="h-3 rounded bg-[#B85C38]"
                        style={{
                          width: `${((expense?.total ?? 0) / maxValue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {!dashboard?.revenueTrend.length && (
              <p className="text-sm text-[#8A7A62]">No trend data yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-[#E4C992]">
              AI Insights
            </p>
            <div className="mt-4 space-y-3">
              {(dashboard?.insights ?? []).map((insight) => (
                <div key={insight._id ?? insight.message}>
                  <h4 className="text-sm font-semibold">
                    {insight.title ?? insight.type}
                  </h4>
                  <p className="mt-1 text-sm text-[#E9DDC9]">
                    {insight.message}
                  </p>
                </div>
              ))}
              {!dashboard?.insights.length && (
                <p className="text-sm text-[#E9DDC9]">No AI insights yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">
              Notifications
            </p>
            <div className="mt-3 space-y-2">
              {(dashboard?.notifications ?? []).map((notification) => (
                <p
                  key={`${notification.source}-${notification.message}`}
                  className="text-sm text-[#6B5C46]"
                >
                  {notification.message}
                </p>
              ))}
              {!dashboard?.notifications.length && (
                <p className="text-sm text-[#6B5C46]">No notifications.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Top Selling Items
            </h4>
          </div>
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
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Inventory Alerts
          </h4>
          <div className="mt-4 space-y-3">
            {(dashboard?.inventoryAlerts ?? []).map((item) => (
              <div
                key={item.itemName}
                className="flex items-center justify-between rounded-lg border border-[#F1D8C7] bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#2A241B]">
                  {item.itemName}
                </span>
                <span className="rounded-full bg-[#F5D0C4] px-2 py-1 text-xs font-semibold text-[#9B3F2C]">
                  {item.quantity} {item.unit ?? ""} left
                </span>
              </div>
            ))}
            {!dashboard?.inventoryAlerts.length && (
              <p className="text-sm text-[#8A7A62]">No low stock items.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Recent Orders
          </h4>
          <div className="mt-4 space-y-3">
            {(dashboard?.recentOrders ?? []).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm"
              >
                <span className="text-[#2A241B]">#{order.id.slice(-6)}</span>
                <span className="text-[#8A7A62]">₹{order.totalAmount}</span>
                <span className="rounded-full bg-[#E7E0D2] px-2 py-1 text-xs">
                  {order.status}
                </span>
              </div>
            ))}
            {!dashboard?.recentOrders.length && (
              <p className="text-sm text-[#8A7A62]">No orders yet.</p>
            )}
          </div>
        </div>
      </section>
      </div>
    </SectionShell>
  );
};

export default DashboardPage;
