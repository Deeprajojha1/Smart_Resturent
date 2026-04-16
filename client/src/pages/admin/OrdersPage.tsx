import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getOrders, getOrderAnalytics } from "../../services/adminService";

const OrdersPage = () => {
  const { data: orders, loading, error } = useAdminResource(getOrders);
  const { data: analytics } = useAdminResource(getOrderAnalytics);
  const summary = analytics?.[0];
  const selectedOrder = orders?.[0];

  return (
    <SectionShell title="POS Orders" subtitle="In-House Sales">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_2fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">Live Orders</h4>
          <div className="mt-4 space-y-3">
            <ResourceState
              loading={loading}
              error={error}
              empty={!orders?.length}
              emptyMessage="No POS orders found."
            />
            {orders?.map((order) => (
              <div
                key={order._id}
                className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2A241B]">
                    #{order._id.slice(-6)}
                  </span>
                  <span className="text-[#8A7A62]">₹{order.totalAmount}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-[#8A7A62]">
                  <span>{order.paymentMethod ?? "payment"}</span>
                  <span>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Sales Summary
          </h4>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Revenue
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                ₹{summary?.totalRevenue ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Orders
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                {summary?.totalOrders ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Avg Ticket
              </p>
              <p className="mt-2 text-xl font-semibold text-[#2A241B]">
                ₹{Math.round(summary?.avgOrderValue ?? 0)}
              </p>
            </div>
          </div>
          {selectedOrder && (
            <div className="mt-6 rounded-lg border border-[#EEE4D5] bg-white p-4">
              <h5 className="font-semibold text-[#2A241B]">
                Latest Order Items
              </h5>
              <div className="mt-3 space-y-2 text-sm text-[#6B5C46]">
                {(selectedOrder.items ?? []).map((item) => (
                  <div key={item.name} className="flex justify-between">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionShell>
  );
};

export default OrdersPage;
