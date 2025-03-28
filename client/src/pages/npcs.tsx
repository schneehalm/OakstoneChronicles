import { useRoute } from "wouter";
import NpcList from "@/components/npc/NpcList";

export default function NpcsPage() {
  const [, params] = useRoute("/hero/:id/npcs");
  const heroId = params?.id || "";
  
  return <NpcList heroId={heroId} />;
}
