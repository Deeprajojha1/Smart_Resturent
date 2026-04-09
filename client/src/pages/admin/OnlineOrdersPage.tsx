import SectionShell from "../../components/admin/SectionShell";

const OnlineOrdersPage = () => {
  return (
    <SectionShell title="Online Orders" subtitle="Delivery & Pickup">
      <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Order Pipeline
          </h4>
          <span className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
            Kanban view
          </span>
        </div>
        <div className="mt-4 h-64 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
          Pending / Confirmed / Preparing / Delivered columns
        </div>
      </div>
    </SectionShell>
  );
};

export default OnlineOrdersPage;
