type StatCardProps = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down" | "flat";
};

const trendStyles: Record<string, string> = {
  up: "text-emerald-700",
  down: "text-rose-600",
  flat: "text-[#7A6C55]",
};

const StatCard = ({ label, value, delta, trend = "flat" }: StatCardProps) => {
  return (
    <div className="rounded-2xl border border-[#E4DCCF] bg-white/90 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.3em] text-[#8A7A62]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold text-[#2A241B]">{value}</p>
      {delta && (
        <p className={`mt-2 text-sm ${trendStyles[trend]}`}>{delta}</p>
      )}
    </div>
  );
};

export default StatCard;
