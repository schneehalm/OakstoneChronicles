import { useRoute } from "wouter";
import QuestList from "@/components/quest/QuestList";

export default function QuestsPage() {
  const [, params] = useRoute("/hero/:id/quests");
  const heroId = params?.id || "";
  
  return <QuestList heroId={heroId} />;
}
