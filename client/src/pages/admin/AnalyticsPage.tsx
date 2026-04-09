import SectionShell from "../../components/admin/SectionShell";

const AnalyticsPage = () => {
  return (
    <SectionShell title="Analytics" subtitle="Performance Tracking">
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Revenue Trends
          </h4>
          <div className="mt-4 h-48 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Chart placeholder
          </div>
        </div>
        <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Category Mix
          </h4>
          <div className="mt-4 h-48 rounded-xl border border-dashed border-[#E4DCCF] bg-[#F9F4EC] p-4 text-sm text-[#8A7A62]">
            Chart placeholder
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default AnalyticsPage;
