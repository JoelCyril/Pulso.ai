import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/sections/HeroSection";
import { SmartWellnessSection } from "@/components/sections/SmartWellnessSection";
import { UnderstandingHealthSection } from "@/components/sections/UnderstandingHealthSection";
import { TrustSection } from "@/components/sections/TrustSection";
import { QuoteSection } from "@/components/sections/QuoteSection";
import { TrustFooter } from "@/components/sections/TrustFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <UnderstandingHealthSection />
        <SmartWellnessSection />
        <TrustSection />
        <QuoteSection />
      </main>
      <TrustFooter />
    </div>
  );
};

export default Index;
