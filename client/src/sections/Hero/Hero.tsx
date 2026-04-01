import Container from "../../components/common/Container";
import Badge from "../../components/common/Badge";
import GlowButton from "../../components/ui/GlowButton";
import HeroVisual from "./HeroVisual";
import SlideUp from "../../components/animations/SlideUp";
import FadeIn from "../../components/animations/FadeIn";

// Redesigned for restaurant landing: Warm welcome, food focus, responsive
const Hero = () => {
  return (
    <section className="section-pad pt-28" id="home">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Badge className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500">
            Welcome to Flavor Haven
          </Badge>
          <SlideUp>
            <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              <span className="gradient-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                Authentic Flavors Await 🍽️
              </span>
              <br />
              <span className="text-2xl md:text-3xl text-white/90">Fresh ingredients, mouthwatering dishes, every bite perfection.</span>
            </h1>
          </SlideUp>
          <p className="max-w-xl text-base text-white/80 md:text-lg">
            Experience the best in Indian, Continental &amp; Fusion cuisine. 
            Order online or visit us for dine-in delight.
          </p>
          <div className="flex flex-wrap gap-4">
            <GlowButton>View Menu</GlowButton>
            <GlowButton variant="secondary">Order Online</GlowButton>
          </div>
          <FadeIn>
            <div className="flex flex-wrap items-center gap-6 text-xs text-white/60 sm:text-sm">
              <span>🌟 4.9/5 Rating</span>
              <span>🍛 200+ Dishes</span>
              <span>🚚 Fast Delivery</span>
              <span>📱 Live Order Track</span>
            </div>
          </FadeIn>
        </div>
        <HeroVisual />
      </Container>
    </section>
  );
};

export default Hero;

