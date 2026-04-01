import Container from "../../components/common/Container";
import GlowButton from "../../components/ui/GlowButton";

const CTA = () => {
  return (
    <section className="section-pad" id="cta">
      <Container>
        <div className="glass relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-glow/20 via-transparent to-cyan/20" />
          <div className="relative z-10 space-y-6">
            <h2 className="font-display text-3xl font-semibold">
              Stop guessing. Start scaling your restaurant.
            </h2>
            <p className="text-white/70">
              LaunchForge gives you the decision engine investors expect from a
              modern AI-first restaurant brand.
            </p>
            <GlowButton>Get Started Now</GlowButton>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTA;
