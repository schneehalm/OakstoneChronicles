import { useRoute } from "wouter";
import NpcList from "@/components/npc/NpcList";
import HeroSubnav from "@/components/hero/HeroSubnav";

export default function NpcsPage() {
  const [, params] = useRoute("/hero/:id/npcs");
  const heroId = params?.id || "";
  
  return (
    <div className="space-y-6">
      {/* Hero Subnav */}
      <HeroSubnav heroId={heroId} activeTab="npcs" />
      
      {/* NPC List */}
      <NpcList heroId={heroId} />
    </div>
  );
}
