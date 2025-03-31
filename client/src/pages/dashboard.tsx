import { useState, useEffect } from "react";
import { Link, Redirect } from "wouter";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HeroCard from "@/components/hero/HeroCard";
import HeroImportExport from "@/components/hero/HeroImportExport";
import { Hero, Activity } from "@/lib/types";
import { fetchHeroes } from "@/lib/api";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  // Wir verwenden jetzt den geschützten Routing-Mechanismus aus App.tsx
  
  // API-Abfragen mit React Query
  // Abfrage für Helden
  const { 
    data: heroes = [], 
    isLoading: isLoadingHeroes,
    isError: isHeroesError,
    refetch: refetchHeroes
  } = useQuery({
    queryKey: ['/api/heroes'],
    queryFn: async () => {
      try {
        return await fetchHeroes();
      } catch (error) {
        console.error("Fehler beim Laden der Helden:", error);
        toast({
          title: "Fehler beim Laden",
          description: "Die Helden konnten nicht geladen werden.",
          variant: "destructive"
        });
        return [];
      }
    }
  });
  
  // Aktivitäten werden noch nicht vom Server abgerufen, da wir zuerst Helden haben müssen
  // Ein leeres Array zurückgeben, da wir Aktivitäten pro Held abrufen müssten
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Setzen Sie die gefilterten Helden, wenn sich die Heldenliste ändert
  useEffect(() => {
    if (heroes) {
      setFilteredHeroes(heroes);
    }
  }, [heroes]);
  
  useEffect(() => {
    // Filter heroes based on search term
    if (searchTerm.trim() === "") {
      setFilteredHeroes(heroes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = heroes.filter(
        hero => 
          hero.name.toLowerCase().includes(term) || 
          hero.race.toLowerCase().includes(term) || 
          hero.class.toLowerCase().includes(term) || 
          hero.system.toLowerCase().includes(term) ||
          (hero.backstory && hero.backstory.toLowerCase().includes(term)) ||
          hero.tags.some(tag => tag.toLowerCase().includes(term))
      );
      setFilteredHeroes(filtered);
    }
  }, [searchTerm, heroes]);
  
  // Aktivitäten werden in dieser Version nicht angezeigt
  // Wir können sie später hinzufügen, wenn wir die entsprechende API implementieren

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="content-heading">Deine Helden</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input 
              type="text" 
              placeholder="Suche nach Helden..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <Search className="absolute right-3 top-2.5 text-[hsl(var(--secondary))]/60 h-5 w-5" />
          </div>
          
          {/* Import/Export Komponente */}
          <HeroImportExport
            heroes={heroes}
            onImportSuccess={() => refetchHeroes()}
          />
        </div>
      </div>

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHeroes.map((hero) => (
          <HeroCard key={hero.id} hero={hero} />
        ))}
        
        {/* Create New Hero Card */}
        <Link href="/hero/create">
          <div className="content-box border-dashed flex flex-col items-center justify-center p-8 group cursor-pointer hover:bg-[hsl(var(--content-box))]/80 transition-all">
            <div className="h-16 w-16 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--content-border))]/30 flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--primary))]/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[hsl(var(--primary))]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="content-heading text-center">Neuen Helden erstellen</h3>
            <p className="text-muted-foreground text-sm text-center mt-2">Beginne eine neue Heldenreise</p>
          </div>
        </Link>
      </div>
      
      {/* Aktivitäten werden in dieser Version nicht angezeigt */}
      
      {heroes.length === 0 && !searchTerm && (
        <>
          <div className="content-box text-center py-16">
            <h3 className="content-heading mb-3">Willkommen bei Oakstone Chronicles</h3>
            <p className="text-muted-foreground mb-6">
              Erstelle deinen ersten Helden, um deine Abenteuer zu dokumentieren.
            </p>
            <Link href="/hero/create">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Neuen Helden erstellen
              </Button>
            </Link>
          </div>
          
          {/* Demo Data Initializer wird in dieser Version nicht verwendet */}
        </>
      )}
      
      {filteredHeroes.length === 0 && searchTerm && (
        <div className="content-box text-center py-10">
          <p className="text-muted-foreground">Keine Helden gefunden. Versuche eine andere Suche.</p>
        </div>
      )}
    </div>
  );
}
