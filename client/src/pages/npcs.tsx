import { useRoute } from "wouter";
import NpcList from "@/components/npc/NpcList";
import HeroLayout from "@/components/layouts/HeroLayout";

export default function NpcsPage() {
  const [, params] = useRoute("/hero/:id/npcs");
  const heroIdString = params?.id || "";
  const heroId = parseInt(heroIdString, 10);
  
  return (
    <HeroLayout heroId={heroIdString} activeTab="npcs">
      <NpcList heroId={heroId} />
    </HeroLayout>
  );
}
