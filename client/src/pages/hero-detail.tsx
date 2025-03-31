import { useRoute } from "wouter";
import HeroDetail from "@/components/hero/HeroDetail";
import HeroLayout from "@/components/layouts/HeroLayout";

export default function HeroDetailPage() {
  const [, params] = useRoute("/hero/:id");
  const heroId = params?.id || "";
  
  return (
    <HeroLayout heroId={heroId} activeTab="overview">
      <HeroDetail heroId={heroId} />
    </HeroLayout>
  );
}
