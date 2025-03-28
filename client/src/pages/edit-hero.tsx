import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import HeroForm from "@/components/hero/HeroForm";
import { getHeroById } from "@/lib/storage";
import { Hero } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function EditHero() {
  const [, params] = useRoute("/hero/:id/edit");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [hero, setHero] = useState<Hero | null>(null);
  const heroId = params?.id || "";
  
  useEffect(() => {
    const loadHero = () => {
      const heroData = getHeroById(heroId);
      
      if (heroData) {
        setHero(heroData);
      } else {
        // Hero not found, redirect to dashboard
        navigate("/");
        toast({
          title: "Held nicht gefunden",
          description: "Der gesuchte Held konnte nicht gefunden werden.",
          variant: "destructive"
        });
      }
    };
    
    loadHero();
  }, [heroId, navigate, toast]);
  
  if (!hero) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Lade Heldendaten...</p>
      </div>
    );
  }
  
  return <HeroForm existingHero={hero} />;
}
