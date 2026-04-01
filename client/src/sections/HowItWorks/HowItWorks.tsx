import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import { steps } from "../../utils/constants";

const HowItWorks = () => {
  return (
    <section className="section-pad" id="how">
      <Container>
        <SectionTitle
          eyebrow="How It Works"
          title="Capture. Process. Predict."
          subtitle="A tight loop from raw data to action in minutes."
        />
        <div className="relative mt-12 grid gap-8 lg:grid-cols-3">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-white/10 lg:block" />
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold">
                0{index + 1}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm text-white/70">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default HowItWorks;
