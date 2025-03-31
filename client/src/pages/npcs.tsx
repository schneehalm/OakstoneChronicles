import { useRoute } from "wouter";
import NpcList from "@/components/npc/NpcList";
import HeroLayout from "@/components/layouts/HeroLayout";

export default function NpcsPage() {
  const [, params] = useRoute("/hero/:id/npcs");
  const heroId = params?.id || "";
  
  return (
    <HeroLayout heroId={heroId} activeTab="npcs">
      <NpcList heroId={heroId} />
    </HeroLayout>
  );
}
