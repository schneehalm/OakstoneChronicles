import { useRoute } from "wouter";
import HeroDetail from "@/components/hero/HeroDetail";

export default function HeroDetailPage() {
  const [, params] = useRoute("/hero/:id");
  const heroId = params?.id || "";
  
  return <HeroDetail heroId={heroId} />;
}
