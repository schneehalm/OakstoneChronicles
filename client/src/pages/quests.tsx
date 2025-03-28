import { useRoute } from "wouter";
import QuestList from "@/components/quest/QuestList";
import HeroSubnav from "@/components/hero/HeroSubnav";

export default function QuestsPage() {
  const [, params] = useRoute("/hero/:id/quests");
  const heroId = params?.id || "";
  
  return (
    <div className="space-y-6">
      {/* Hero Subnav */}
      <HeroSubnav heroId={heroId} activeTab="quests" />
      
      {/* Quest List */}
      <QuestList heroId={heroId} />
    </div>
  );
}
