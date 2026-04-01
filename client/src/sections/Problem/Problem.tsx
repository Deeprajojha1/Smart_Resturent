import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import FadeIn from "../../components/animations/FadeIn";
import { problems } from "../../utils/constants";

const Problem = () => {
  return (
    <section className="section-pad" id="problem">
      <Container>
        <SectionTitle
          eyebrow="The Chaos"
          title="Fragmented systems are bleeding your margins."
          subtitle="Most restaurants operate with five tools that never talk to each other."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {problems.map((problem) => (
            <FadeIn key={problem.title}>
              <div className="rounded-2xl border border-ember/40 bg-white/5 p-6 shadow-ember">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  {problem.title}
                </h3>
                <p className="text-sm text-white/70">{problem.description}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Problem;
