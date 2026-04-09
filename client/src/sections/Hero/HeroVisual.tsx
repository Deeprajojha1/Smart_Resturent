import Floating from "../../components/animations/Floating";
import FadeIn from "../../components/animations/FadeIn";
import SlideUp from "../../components/animations/SlideUp";
import GlassCard from "../../components/ui/GlassCard";
import dosa from "../../assets/images/dosa.png";
import pizza from "../../assets/images/pizza.png";
import indianThali from "../../assets/images/indian-thali.png";
import paneer from "../../assets/images/panner.jpg";

// Restaurant HeroVisual: Featured specials with local hero image
const HeroVisual = () => {
  const featured = [
    { img: dosa, name: "Masala Dosa", rating: "4.9" },
    { img: pizza, name: "Margherita Pizza", rating: "4.8" },
    { img: indianThali, name: "Indian Thali", rating: "4.7" },
    { img: paneer, name: "Paneer Butter Masala", rating: "5.0" },
  ];

  return (
    <div className="relative">
      <div className="absolute -left-10 top-6 h-24 w-24 rounded-full bg-orange-400/30 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-24 w-24 rounded-full bg-amber-400/30 blur-3xl" />
      <GlassCard className="relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-orange/5 via-amber/5 to-red/5" />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-orange-400">
              Today's Specials
            </p>
            <span className="rounded-full bg-emerald/20 px-2 py-1 text-xs font-medium text-emerald-300">
              Fresh Daily
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {featured.map((item) => (
              <SlideUp key={item.name}>
                <div className="group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-r from-orange/10 p-3 transition-all duration-300 hover:scale-105">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="h-20 w-full rounded-lg object-cover shadow-lg transition-transform group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-white">
                      {item.name}
                    </p>
                    <div className="text-xs text-amber-400">
                      Rating: {item.rating}
                    </div>
                  </div>
                </div>
              </SlideUp>
            ))}
          </div>
          <FadeIn>
            <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-white/70">Daily Customers</p>
                <p className="text-xl font-bold text-emerald-400">500+</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-white/70">Happy Reviews</p>
                <p className="text-xl font-bold text-orange-400">10K+</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </GlassCard>
      <Floating className="absolute -right-4 top-4 rounded-xl border border-amber/30 bg-gradient-to-r from-amber-500/20 px-3 py-2 text-xs font-medium text-amber-100 shadow-lg">
        HOT: Today's Top Pick - Dosa
      </Floating>
    </div>
  );
};

export default HeroVisual;
