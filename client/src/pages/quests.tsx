import { useRoute } from "wouter";
import QuestList from "@/components/quest/QuestList";
import HeroLayout from "@/components/layouts/HeroLayout";

export default function QuestsPage() {
  const [, params] = useRoute("/hero/:id/quests");
  const heroId = params?.id || "";
  
  return (
    <HeroLayout heroId={heroId} activeTab="quests">
      <QuestList heroId={heroId} />
    </HeroLayout>
  );
}
