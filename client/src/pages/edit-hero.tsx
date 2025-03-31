import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import HeroForm from "@/components/hero/HeroForm";
import { fetchHeroById } from "@/lib/api";
import { Hero } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function EditHero() {
  const [, params] = useRoute("/hero/:id/edit");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const heroId = params?.id || "";
  
  // Verwende React Query, um den Helden abzurufen
  const { 
    data: hero,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['/api/heroes', heroId],
    queryFn: async () => {
      try {
        return await fetchHeroById(heroId);
      } catch (error) {
        console.error("Fehler beim Laden des Helden:", error);
        toast({
          title: "Held nicht gefunden",
          description: "Der gesuchte Held konnte nicht gefunden werden.",
          variant: "destructive"
        });
        navigate("/");
        throw error;
      }
    },
    enabled: !!heroId
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Lade Heldendaten...</p>
      </div>
    );
  }
  
  if (isError || !hero) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.</p>
      </div>
    );
  }
  
  return <HeroForm existingHero={hero} />;
}
