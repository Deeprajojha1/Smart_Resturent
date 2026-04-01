import Container from "../../components/common/Container";
import SectionTitle from "../../components/common/SectionTitle";
import FeatureList from "./FeatureList";

// Redesigned for restaurant landing: "Why Choose Us" theme
const Features = () => {
  return (
    <section className="section-pad py-24" id="features">
      <Container>
        <SectionTitle
          eyebrow="Why Choose Us"
          title="Exceptional Dining Experience"
          subtitle="Discover what makes Flavor Haven the perfect choice for your next meal."
        />
        <FeatureList />
      </Container>
    </section>
  );
};

export default Features;
