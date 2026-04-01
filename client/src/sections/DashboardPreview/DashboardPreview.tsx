import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import GlassCard from "../../components/ui/GlassCard";
import StatCard from "../../components/ui/StatCard";
import { stats } from "../../utils/constants";

const DashboardPreview = () => {
  return (
    <section className="section-pad" id="dashboard">
      <Container>
        <SectionTitle
          eyebrow="Dashboard"
          title="Your entire operation, in one intelligent view."
          subtitle="Revenue, profit, and top menu intelligence update in real time."
        />
        <GlassCard className="mt-10 overflow-hidden p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <div className="h-48 rounded-2xl bg-gradient-to-r from-glow/40 via-azure/40 to-cyan/40" />
              <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <GlassCard className="rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  Top Dishes
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Truffle Pasta</span>
                    <span className="text-cyan">+18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Spicy Ramen</span>
                    <span className="text-cyan">+12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Fire Pizza</span>
                    <span className="text-cyan">+9%</span>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/50">
                  Expense Breakdown
                </p>
                <div className="mt-4 h-28 rounded-xl bg-white/10" />
              </GlassCard>
            </div>
          </div>
        </GlassCard>
      </Container>
    </section>
  );
};

export default DashboardPreview;
