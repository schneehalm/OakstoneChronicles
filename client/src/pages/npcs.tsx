import { useRoute } from "wouter";
import NpcList from "@/components/npc/NpcList";
import HeroSubnav from "@/components/hero/HeroSubnav";

export default function NpcsPage() {
  const [, params] = useRoute("/hero/:id/npcs");
  const heroId = params?.id || "";
  
  return (
    <div>
      {/* Hero Subnav - immer oben */}
      <div className="mb-6 subnav-header">
        <HeroSubnav heroId={heroId} activeTab="npcs" />
      </div>
      
      {/* NPC List */}
      <NpcList heroId={heroId} />
    </div>
  );
}
