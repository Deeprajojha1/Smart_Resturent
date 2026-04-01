import type { Feature } from "../../types";
import GlassCard from "./GlassCard";

// Updated for restaurant features: Display emoji icon
const FeatureCard = ({ title, description, icon }: Feature) => {
  return (
    <GlassCard className="group h-full p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-glow hover:shadow-orange-500/30">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 shadow-lg group-hover:scale-110 transition-all duration-300 border border-orange-400/30">
        <span className="text-2xl">{icon}</span>
      </div>
      <h3 className="mb-4 text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{title}</h3>
      <p className="text-sm leading-relaxed text-white/80">{description}</p>
    </GlassCard>
  );
};

export default FeatureCard;

