import SectionShell from "../../components/admin/SectionShell";

const AIInsightsPage = () => {
  return (
    <SectionShell title="AI Insights" subtitle="Recommendations">
      <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
        <h4 className="text-lg font-semibold text-[#2A241B]">
          Insights Feed
        </h4>
        <div className="mt-4 space-y-3">
          <div className="rounded-xl border border-[#EEE4D5] bg-[#F9F4EC] p-4 text-sm text-[#6B5C46]">
            Profit insight placeholder
          </div>
          <div className="rounded-xl border border-[#EEE4D5] bg-[#F9F4EC] p-4 text-sm text-[#6B5C46]">
            Warning insight placeholder
          </div>
        </div>
      </div>
    </SectionShell>
  );
};

export default AIInsightsPage;
