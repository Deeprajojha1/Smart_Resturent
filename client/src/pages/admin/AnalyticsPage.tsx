import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  getDashboardAnalytics,
  getOrderAnalytics,
  getTopDishes,
} from "../../services/adminService";

const AnalyticsPage = () => {
  const { data: dashboard, loading, error } = useAdminResource(getDashboardAnalytics);
  const { data: orders } = useAdminResource(getOrderAnalytics);
  const { data: topDishes } = useAdminResource(getTopDishes);
  const sales = orders?.[0];

  return (
    <SectionShell title="Analytics" subtitle="Performance Tracking">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Revenue Trends
          </h4>
          <div className="mt-4 space-y-3">
            <ResourceState
              loading={loading}
              error={error}
              empty={!dashboard?.revenueTrend.length}
              emptyMessage="No revenue trend data."
            />
            {(dashboard?.revenueTrend ?? []).map((item) => (
              <div key={`${item._id.year}-${item._id.month}`}>
                <div className="flex justify-between text-sm text-[#6B5C46]">
                  <span>
                    {item._id.month}/{item._id.year}
                  </span>
                  <span>₹{item.total}</span>
                </div>
                <div className="mt-2 h-3 rounded bg-[#E4DCCF]">
                  <div
                    className="h-3 rounded bg-[#3F6F5B]"
                    style={{
                      width: `${Math.min(
                        100,
                        (item.total /
                          Math.max(
                            ...((dashboard?.revenueTrend ?? []).map(
                              (point) => point.total
                            )),
                            1
                          )) *
                          100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">Sales Mix</h4>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Revenue
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                ₹{sales?.totalRevenue ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Orders
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                {sales?.totalOrders ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Avg Ticket
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                ₹{Math.round(sales?.avgOrderValue ?? 0)}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {(topDishes ?? []).map((dish) => (
              <div key={dish._id} className="flex justify-between text-sm">
                <span className="font-medium text-[#2A241B]">{dish._id}</span>
                <span className="text-[#8A7A62]">{dish.totalSold} sold</span>
              </div>
            ))}
            {!topDishes?.length && (
              <p className="text-sm text-[#8A7A62]">No top dish data.</p>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default AnalyticsPage;
