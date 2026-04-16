import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getOnlineOrders } from "../../services/adminService";

const statuses = ["pending", "confirmed", "preparing", "delivered", "cancelled"];

const OnlineOrdersPage = () => {
  const { data: orders, loading, error } = useAdminResource(getOnlineOrders);

  return (
    <SectionShell title="Online Orders" subtitle="Delivery & Pickup">
      <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Order Pipeline
          </h4>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
            {orders?.length ?? 0} orders
          </span>
        </div>
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
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
};

export default OnlineOrdersPage;
