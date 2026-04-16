import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import {
  getInventoryStats,
  getLowStock,
  getReorderSuggestions,
} from "../../services/adminService";

const InventoryPage = () => {
  const { data: lowStock, loading, error } = useAdminResource(getLowStock);
  const { data: reorder } = useAdminResource(getReorderSuggestions);
  const { data: stats } = useAdminResource(getInventoryStats);
  const totals = stats?.[0];

  return (
    <SectionShell title="Inventory" subtitle="Stock & Supply">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Inventory Status
            </h4>
            <span className="rounded-full bg-[#F7F1E8] px-3 py-1 text-xs font-semibold text-[#6B5C46]">
              {totals?.totalItems ?? 0} items
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Total Stock
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#2A241B]">
                {totals?.totalStock ?? 0}
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                Reorder Needed
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#2A241B]">
                {reorder?.length ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <h5 className="font-semibold text-[#2A241B]">Reorder Suggestions</h5>
            <ResourceState
              loading={loading}
              error={error}
              empty={!reorder?.length}
              emptyMessage="No reorder suggestions."
            />
            {reorder?.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between rounded-lg border border-[#EEE4D5] bg-white px-3 py-2 text-sm"
              >
                <span className="font-medium text-[#2A241B]">{item.itemName}</span>
                <span className="text-[#8A7A62]">
                  {item.quantity} {item.unit ?? ""} / threshold{" "}
                  {item.lowStockThreshold ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Low Stock Alerts
          </h4>
          <div className="mt-3 space-y-3">
            <ResourceState
              loading={loading}
              error={error}
              empty={!lowStock?.length}
              emptyMessage="No low stock alerts."
            />
            {lowStock?.map((item) => (
              <div
                key={item._id}
                className="rounded-lg border border-[#F1D8C7] bg-white p-3 text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#2A241B]">
                    {item.itemName}
                  </span>
                  <span className="text-[#9B3F2C]">
                    {item.quantity} {item.unit ?? ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default InventoryPage;
