import { useEffect, useMemo, useState } from "react";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { getOrders, getOrderAnalytics } from "../../services/adminService";

const OrdersPage = () => {
  const itemsPerPage = 5;
  const { data: orders, loading, error } = useAdminResource(getOrders);
  const { data: analytics } = useAdminResource(getOrderAnalytics);
  const [currentPage, setCurrentPage] = useState(1);
  const summary = analytics?.[0];

  const totalPages = Math.max(1, Math.ceil((orders?.length ?? 0) / itemsPerPage));

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return (orders ?? []).slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage, orders]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [orders?.length]);

  const selectedOrder = paginatedOrders[0] ?? orders?.[0];

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
            {paginatedOrders.map((order) => (
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

            {!!orders?.length && (
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
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
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
