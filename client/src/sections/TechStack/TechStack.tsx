import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import Badge from "../../components/common/Badge";
import { techStack } from "../../utils/constants";

const TechStack = () => {
  return (
    <section className="section-pad">
      <Container>
        <SectionTitle
          eyebrow="Tech Stack"
          title="Built like a serious SaaS platform."
          subtitle="LaunchForge is engineered for scale, speed, and AI reliability."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {techStack.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default TechStack;
