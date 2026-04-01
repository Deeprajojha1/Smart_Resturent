import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PageWrapper from "../components/layout/PageWrapper";
import Hero from "../sections/Hero/Hero";
import Problem from "../sections/Problem/Problem";
import Solution from "../sections/Solution/Solution";
import Features from "../sections/Features/Features";
import CTA from "../sections/CTA/CTA";
import PopularFoods from "../sections/PopularFoods/PopularFoods";

// Restaurant redesign: Reordered sections - Hero, PopularFoods prominent, repurposed others, commented AI-specific
const LandingPage = () => {
  return (
    <PageWrapper>
      <Navbar />
      <main>
        <Hero />
        <PopularFoods /> {/* Promoted for food focus */}
        <Problem /> {/* Repurposed as "Why Choose Us" */}
        <Solution /> {/* Our Approach/Specialties */}
        <Features /> {/* Menu Features/Services */}
        {/* <HowItWorks /> AI-specific, commented out */}
        {/* <DashboardPreview /> AI-specific, commented out */}
        {/* <Roles /> AI-specific, commented out */}
        <CTA /> {/* Keep for ordering CTA */}
      </main>
      <Footer />
    </PageWrapper>
  );
};

export default LandingPage;

