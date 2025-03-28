import { useRoute } from "wouter";
import HeroDetail from "@/components/hero/HeroDetail";
import HeroSubnav from "@/components/hero/HeroSubnav";

export default function HeroDetailPage() {
  const [, params] = useRoute("/hero/:id");
  const heroId = params?.id || "";
  
  return (
    <div>
      {/* Hero Subnav - immer oben */}
      <div className="mb-6 sticky top-0 z-10 bg-[#1e1e2f]/95 backdrop-blur-sm pt-4 pb-1">
        <HeroSubnav heroId={heroId} activeTab="overview" />
      </div>
      
      {/* Hero Detail */}
      <HeroDetail heroId={heroId} />
    </div>
  );
}
