import type { Stat } from "../../types";
import GlassCard from "./GlassCard";

const StatCard = ({ label, value, trend }: Stat) => {
  return (
    <GlassCard className="space-y-2 rounded-2xl p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-white/50">
        {label}
      </p>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <span className="text-xs text-cyan">{trend}</span>
      </div>
    </GlassCard>
  );
};

export default StatCard;
