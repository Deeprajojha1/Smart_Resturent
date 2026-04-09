import { useEffect } from "react";
import StatCard from "../../components/admin/StatCard";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardSummary } from "../../store/adminSlice";

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { dashboard, status } = useAppSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardSummary(undefined));
  }, [dispatch]);

  return (
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
          <div className="rounded-2xl border border-[#E4DCCF] bg-white/60 p-5">
            Loading dashboard...
          </div>
        )}
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
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
          <div className="mt-6 h-56 rounded-2xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Chart placeholder (hook up to analytics chart here)
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#D6B26E] bg-[#2A241B] p-6 text-[#F7F1E8] shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-[#E4C992]">
              AI Recommendation
            </p>
            <h4 className="mt-3 text-lg font-semibold">
              Labor Cost Optimization
            </h4>
            <p className="mt-2 text-sm text-[#E9DDC9]">
              Staffing is 14% above demand for mid-day. Adjusting shifts can
              save ₹12,400 this week.
            </p>
            <button className="mt-4 rounded-full bg-[#C28B2C] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#2A241B]">
              Apply Recommendation
            </button>
          </div>

          <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">
              Prediction
            </p>
            <h4 className="mt-3 text-lg font-semibold text-[#2A241B]">
              Weekend Surge Expected
            </h4>
            <p className="mt-2 text-sm text-[#6B5C46]">
              Local event likely to boost footfall by 24%. Prepare 2x inventory
              of signature items.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Top Selling Items
            </h4>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
              View all
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {(dashboard?.topDishes ?? []).map((dish) => (
              <div
                key={dish.name}
                className="flex items-center justify-between rounded-xl border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#2A241B]">{dish.name}</span>
                <span className="text-[#8A7A62]">{dish.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Inventory Alerts
          </h4>
          <div className="mt-4 space-y-3">
            {(dashboard?.inventoryAlerts ?? []).map((item) => (
              <div
                key={item.itemName}
                className="flex items-center justify-between rounded-xl border border-[#F1D8C7] bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#2A241B]">
                  {item.itemName}
                </span>
                <span className="rounded-full bg-[#F5D0C4] px-2 py-1 text-xs font-semibold text-[#9B3F2C]">
                  {item.quantity} left
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Recent Orders
          </h4>
          <div className="mt-4 space-y-3">
            {(dashboard?.recentOrders ?? []).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-[#EEE4D5] bg-[#F9F4EC] px-3 py-2 text-sm"
              >
                <span className="text-[#2A241B]">#{order.id.slice(-6)}</span>
                <span className="text-[#8A7A62]">₹{order.totalAmount}</span>
                <span className="rounded-full bg-[#E7E0D2] px-2 py-1 text-xs">
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
