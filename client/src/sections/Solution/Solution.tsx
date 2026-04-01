import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import GlassCard from "../../components/ui/GlassCard";

const Solution = () => {
  return (
    <section className="section-pad" id="solution">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionTitle
          eyebrow="Solution"
          title={
            <>
              One platform. <span className="gradient-text">Total control.</span>
            </>
          }
          subtitle="LaunchForge unifies finance, inventory, and AI decisioning so you run the business, not the spreadsheets."
        />
        <GlassCard className="relative overflow-hidden p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-glow/20 via-transparent to-cyan/20" />
          <div className="relative z-10 space-y-4">
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">
              Unified Command Center
            </p>
            <h3 className="text-2xl font-semibold text-white">
              AI-driven visibility across every location.
            </h3>
            <p className="text-sm text-white/70">
              Real-time P&L, stock accuracy, labor performance, and predictive
              alerts with zero manual reconciliation.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                Finance
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                Inventory
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
                AI Insights
              </span>
            </div>
          </div>
        </GlassCard>
      </Container>
    </section>
  );
};

export default Solution;
