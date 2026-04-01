import FeatureCard from "../../components/ui/FeatureCard";
import { features } from "../../utils/constants";

const FeatureList = () => {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  );
};

export default FeatureList;
