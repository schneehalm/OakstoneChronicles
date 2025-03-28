import { useRoute } from "wouter";
import QuestList from "@/components/quest/QuestList";
import HeroSubnav from "@/components/hero/HeroSubnav";

export default function QuestsPage() {
  const [, params] = useRoute("/hero/:id/quests");
  const heroId = params?.id || "";
  
  return (
    <div>
      {/* Hero Subnav - immer oben */}
      <div className="mb-6 sticky top-0 z-10 bg-[#1e1e2f]/95 backdrop-blur-sm pt-4 pb-1">
        <HeroSubnav heroId={heroId} activeTab="quests" />
      </div>
      
      {/* Quest List */}
      <QuestList heroId={heroId} />
    </div>
  );
}
