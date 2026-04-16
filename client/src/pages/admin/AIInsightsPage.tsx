import { useState } from "react";
import { FiLoader, FiZap } from "react-icons/fi";
import SectionShell from "../../components/admin/SectionShell";
import ResourceState from "../../components/admin/ResourceState";
import { useAdminResource } from "../../customhooks/useAdminResource";
import { generateInsights, getInsights } from "../../services/adminService";

const AIInsightsPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const { data: insights, loading, error } = useAdminResource(
    getInsights,
    [refreshKey]
  );

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateInsights();
      setRefreshKey((key) => key + 1);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <SectionShell title="AI Insights" subtitle="Recommendations">
      <div className="rounded-lg border border-[#E4DCCF] bg-white/90 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-[#2A241B]">
            Insights Feed
          </h4>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2A241B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#F7F1E8] disabled:opacity-60"
          >
            {generating ? (
              <>
                <FiLoader className="h-4 w-4 animate-spin" aria-hidden="true" />
                Generating
              </>
            ) : (
              <>
                <FiZap className="h-4 w-4" aria-hidden="true" />
                Generate
              </>
            )}
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <ResourceState
            loading={loading}
            error={error}
            empty={!insights?.length}
            emptyMessage="No AI insights found."
          />
          {insights?.map((insight) => (
            <div
              key={insight._id ?? insight.message}
              className="rounded-lg border border-[#EEE4D5] bg-[#F9F4EC] p-4 text-sm text-[#6B5C46]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold capitalize text-[#2A241B]">
                  {insight.title ?? insight.type}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-[#8A7A62]">
                  {insight.type}
                </span>
              </div>
              <p className="mt-2">{insight.message}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
};

export default AIInsightsPage;
