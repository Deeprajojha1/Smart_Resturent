import Container from "../common/Container";
/* config not used, hardcoded for restaurant */

// Updated for restaurant: Flavor Haven info, relevant links
const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 bg-gradient-to-r from-black/50 via-gray-900/50 to-black/50 py-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-orange/30 via-amber/30 to-red/30" />
      <Container className="grid gap-10 text-sm text-white/70 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              🍽️ Flavor Haven
            </span>
          </div>
          <p className="max-w-md leading-relaxed">
            Your favorite spot for authentic Indian, Continental &amp; Fusion cuisine. 
            Fresh ingredients, passionate chefs, unforgettable flavors.
          </p>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
            Taste the Difference
          </span>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold">
            Menu
          </p>
          <a className="block hover:text-orange-400 transition-colors" href="#menu">
            Popular Foods
          </a>
          <a className="block hover:text-orange-400 transition-colors" href="#features">
            Specialties
          </a>
        </div>
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-semibold">
            Contact
          </p>
          <a className="block hover:text-orange-400 transition-colors" href="#cta">
            Order Now
          </a>
          <a className="block hover:text-orange-400 transition-colors" href="tel:+1234567890">
            +1 (234) 567-890
          </a>
          <a className="block hover:text-orange-400 transition-colors" href="mailto:hello@flavorhaven.com">
            hello@flavorhaven.com
          </a>
        </div>
        <div className="md:col-span-3 flex flex-col items-start justify-between gap-4 pt-8 border-t border-white/10 text-xs text-white/50 md:flex-row md:pt-6">
          <span>&copy; {new Date().getFullYear()} Flavor Haven. All rights reserved.</span>
          <div className="flex gap-6">
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Privacy</span>
            <span className="hover:text-orange-400 transition-colors cursor-pointer">Terms</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
