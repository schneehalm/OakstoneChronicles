import { useRoute } from "wouter";
import SessionList from "@/components/session/SessionList";

export default function SessionsPage() {
  const [, params] = useRoute("/hero/:id/sessions");
  const heroId = params?.id || "";
  
  return <SessionList heroId={heroId} />;
}
