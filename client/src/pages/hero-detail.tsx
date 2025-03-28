import { useRoute } from "wouter";
import HeroDetail from "@/components/hero/HeroDetail";
import HeroSubnav from "@/components/hero/HeroSubnav";

export default function HeroDetailPage() {
  const [, params] = useRoute("/hero/:id");
  const heroId = params?.id || "";
  
  return (
    <div className="space-y-6">
      {/* Hero Subnav */}
      <HeroSubnav heroId={heroId} activeTab="overview" />
      
      {/* Hero Detail */}
      <HeroDetail heroId={heroId} />
    </div>
  );
}
