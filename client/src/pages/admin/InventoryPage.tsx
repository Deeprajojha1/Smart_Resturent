import SectionShell from "../../components/admin/SectionShell";

const InventoryPage = () => {
  return (
    <SectionShell title="Inventory" subtitle="Stock & Supply">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Inventory Items
          </h4>
          <div className="mt-4 h-56 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Table placeholder (item, quantity, unit, threshold)
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#F0D2C0] bg-[#FFF7F2] p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Low Stock Alerts
            </h4>
            <div className="mt-3 text-sm text-[#8A7A62]">
              Items nearing threshold will appear here.
            </div>
          </div>
          <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-[#2A241B]">
              Quick Update
            </h4>
            <div className="mt-4 h-24 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
              Stock adjustment widget
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default InventoryPage;
