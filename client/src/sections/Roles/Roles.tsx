import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import GlassCard from "../../components/ui/GlassCard";
import { roles } from "../../utils/constants";

const Roles = () => {
  return (
    <section className="section-pad" id="roles">
      <Container>
        <SectionTitle
          eyebrow="Roles & Access"
          title="Real-world permissions baked in."
          subtitle="Give every team member the exact power they need."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <GlassCard key={role.title} className="p-6">
              <div className="mb-4 h-10 w-10 rounded-xl bg-white/10" />
              <h3 className="mb-2 text-lg font-semibold text-white">
                {role.title}
              </h3>
              <p className="text-sm text-white/70">{role.description}</p>
            </GlassCard>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Roles;
