import { useRoute } from "wouter";
import SessionList from "@/components/session/SessionList";
import HeroSubnav from "@/components/hero/HeroSubnav";

export default function SessionsPage() {
  const [, params] = useRoute("/hero/:id/sessions");
  const heroId = params?.id || "";
  
  return (
    <div className="space-y-6">
      {/* Hero Subnav */}
      <HeroSubnav heroId={heroId} activeTab="sessions" />
      
      {/* Session List */}
      <SessionList heroId={heroId} />
    </div>
  );
}
