import { useRoute } from "wouter";
import SessionList from "@/components/session/SessionList";
import HeroLayout from "@/components/layouts/HeroLayout";

export default function SessionsPage() {
  const [, params] = useRoute("/hero/:id/sessions");
  const heroId = params?.id || "";
  
  return (
    <HeroLayout heroId={heroId} activeTab="sessions">
      <SessionList heroId={heroId} />
    </HeroLayout>
  );
}
