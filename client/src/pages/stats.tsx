import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STATS_DEFINITIONS } from "@/lib/theme";
import { Hero } from "@/lib/types";
import { getHeroById } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

export default function StatsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [hero, setHero] = useState<Hero | null>(null);
  
  // Extrahiere die heroId aus der URL
  const pathname = window.location.pathname;
  const heroIdMatch = pathname.match(/\/hero\/([^\/]+)\/stats/);
  const heroId = heroIdMatch ? heroIdMatch[1] : '';
  
  useEffect(() => {
    // Lade Heldendaten
    const loadHero = () => {
      const heroData = getHeroById(heroId);
      
      if (heroData) {
        setHero(heroData);
      } else {
        // Held nicht gefunden, zurück zum Dashboard
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
  
  return (
    <div className="space-y-6">
      {/* Header mit Zurück-Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/hero/${heroId}`)}
            className="text-[#f5f5f5]/70 hover:text-[#f5f5f5]"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37]">
            {hero.name} - Attribute & Statistiken
          </h2>
        </div>
      </div>
      
      {/* Stats Content */}
      <div className="bg-[#1e1e2f]/80 rounded-xl border border-[#d4af37]/30 p-6 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2720%27%20height%3D%2720%27%20viewBox%3D%270%200%2020%2020%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27%237f5af0%27%20fill-opacity%3D%270.05%27%20fill-rule%3D%27evenodd%27%3E%3Ccircle%20cx%3D%273%27%20cy%3D%273%27%20r%3D%271%27%2F%3E%3Ccircle%20cx%3D%2713%27%20cy%3D%2713%27%20r%3D%271%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
        {hero.stats && Object.keys(hero.stats).length > 0 ? (
          <div className="space-y-6">
            {/* System Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-4 border-b border-[#7f5af0]/20">
              <div>
                <h3 className="text-lg font-medium text-[#d4af37]">Regelwerk</h3>
                <p className="text-sm text-[#f5f5f5]/70">{hero.system}</p>
              </div>
              <div className="flex gap-2">
                <div className="bg-[#7f5af0]/20 text-[#f5f5f5] px-3 py-1 rounded-full text-sm border border-[#7f5af0]/30">
                  Lvl {hero.level}
                </div>
                <div className="bg-[#d4af37]/20 text-[#f5f5f5] px-3 py-1 rounded-full text-sm border border-[#d4af37]/30">
                  {hero.class}
                </div>
              </div>
            </div>
            
            {/* Statistiken Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {hero.system && STATS_DEFINITIONS[hero.system as keyof typeof STATS_DEFINITIONS] ? (
                // Zeige die Statistiken basierend auf dem Regelwerk
                STATS_DEFINITIONS[hero.system as keyof typeof STATS_DEFINITIONS]
                  .filter(stat => hero.stats && hero.stats[stat.id] !== undefined)
                  .map(stat => (
                    <Card
                      key={stat.id}
                      className="bg-gradient-to-br from-[#1e1e2f] to-[#7f5af0]/10 border border-[#7f5af0]/20 shadow-md overflow-hidden"
                    >
                      <div className="p-4 text-center">
                        <div className="text-[#f5f5f5]/90 mb-1 font-medium">{stat.label}</div>
                        <div className="text-3xl font-bold text-[#d4af37]">
                          {hero.stats ? hero.stats[stat.id] : '–'}
                        </div>
                        <div className="mt-2 text-xs text-[#f5f5f5]/50">
                          {stat.id === 'strength' && "Beeinflusst Nahkampfangriffe"}
                          {stat.id === 'dexterity' && "Beeinflusst Gewandtheit & Präzision"}
                          {stat.id === 'constitution' && "Beeinflusst Ausdauer & Widerstand"}
                          {stat.id === 'intelligence' && "Beeinflusst Wissen & Magie"}
                          {stat.id === 'wisdom' && "Beeinflusst Wahrnehmung & Intuition"}
                          {stat.id === 'charisma' && "Beeinflusst soziale Interaktionen"}
                          {stat.id === 'maxHp' && "Maximale Trefferpunkte"}
                          {stat.id === 'currentHp' && "Aktuelle Trefferpunkte"}
                        </div>
                      </div>
                    </Card>
                  ))
              ) : (
                // Generische Anzeige, wenn kein passendes Regelwerk gefunden wird
                Object.entries(hero.stats || {}).map(([key, value]) => (
                  <Card
                    key={key}
                    className="bg-gradient-to-br from-[#1e1e2f] to-[#7f5af0]/10 border border-[#7f5af0]/20 shadow-md overflow-hidden"
                  >
                    <div className="p-4 text-center">
                      <div className="text-[#f5f5f5]/90 mb-1 font-medium">{key}</div>
                      <div className="text-3xl font-bold text-[#d4af37]">{value}</div>
                    </div>
                  </Card>
                ))
              )}
            </div>
            
            {/* Kurze Erklärung */}
            <div className="mt-6 p-4 bg-[#d4af37]/10 rounded-lg border border-[#d4af37]/20">
              <h4 className="text-sm font-medium text-[#d4af37] mb-2">Über Attribute & Statistiken</h4>
              <p className="text-sm text-[#f5f5f5]/80">
                Attribute und Statistiken bestimmen die Fähigkeiten und Stärken deines Charakters im Spiel.
                Sie beeinflussen Würfelwürfe, Kampfwerte und Fertigkeitsproben.
                Die spezifischen Attribute hängen vom gewählten Spielsystem ab.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center">
            <div className="text-[#f5f5f5]/50 text-xl mb-4">Keine Statistiken verfügbar</div>
            <p className="text-[#f5f5f5]/70 max-w-md">
              Dieser Held hat noch keine Statistiken. Du kannst Statistiken hinzufügen, indem du den Helden bearbeitest und ein Regelwerk auswählst.
            </p>
            <Button
              className="mt-4 bg-[#7f5af0]/20 hover:bg-[#7f5af0]/30 border border-[#7f5af0]/40 text-[#f5f5f5]"
              onClick={() => navigate(`/hero/${heroId}/edit`)}
            >
              Held bearbeiten
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}