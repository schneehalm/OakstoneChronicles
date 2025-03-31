import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronRight, Edit, MoreHorizontal, ChevronUp, ChevronDown, Trash2, FileText, Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Hero, Npc, Session, Quest } from "@/lib/types";
import { 
  deleteHero, 
  fetchHeroById, 
  fetchNpcsByHeroId, 
  fetchQuestsByHeroId, 
  fetchSessionsByHeroId 
} from "@/lib/api";
import { STATS_DEFINITIONS } from "@/lib/theme";
import NpcCard from "@/components/npc/NpcCard";
import QuestItem from "@/components/quest/QuestItem";
import { useToast } from "@/hooks/use-toast";
import HeroSubnav from "@/components/hero/HeroSubnav";
import DeleteHeroDialog from "@/components/hero/DeleteHeroDialog";
import { useQuery } from "@tanstack/react-query";

interface HeroDetailProps {
  heroId: string;
}

export default function HeroDetail({ heroId }: HeroDetailProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Lade Heldendaten mit React Query
  const { 
    data: hero, 
    isLoading: isLoadingHero, 
    error: heroError
  } = useQuery({
    queryKey: ['/api/heroes', heroId],
    queryFn: () => fetchHeroById(heroId),
    retry: 2,  // Versuche 2 Mal erneut, wenn der Abruf fehlschlägt
    staleTime: 5000 // Daten gelten 5 Sekunden lang als "frisch"
  });
  
  // Lade NPCs, nutze heroId als Abhängigkeit
  const { 
    data: npcs = [], 
    isLoading: isLoadingNpcs 
  } = useQuery({
    queryKey: ['/api/heroes', heroId, 'npcs'],
    queryFn: () => fetchNpcsByHeroId(heroId),
    enabled: !!hero, // Lädt nur, wenn der Held existiert
    staleTime: 5000
  });
  
  // Lade Quests
  const { 
    data: quests = [], 
    isLoading: isLoadingQuests 
  } = useQuery({
    queryKey: ['/api/heroes', heroId, 'quests'],
    queryFn: () => fetchQuestsByHeroId(heroId),
    enabled: !!hero,
    staleTime: 5000
  });
  
  // Lade Sessions
  const { 
    data: sessions = [], 
    isLoading: isLoadingSessions 
  } = useQuery({
    queryKey: ['/api/heroes', heroId, 'sessions'],
    queryFn: () => fetchSessionsByHeroId(heroId),
    enabled: !!hero,
    staleTime: 5000
  });
  
  // Berechne abgeleitete Daten
  const recentNpcs = npcs.slice(0, 3);
  const favoriteNpcs = npcs.filter(npc => npc.favorite).slice(0, 6);
  const activeQuests = quests.filter(quest => quest.completed === false).slice(0, 3);
  const latestSession = sessions.length > 0 
    ? sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] 
    : null;
  
  const handleDeleteHero = async () => {
    if (hero) {
      try {
        await deleteHero(heroId);
        navigate("/");
        toast({
          title: "Held gelöscht",
          description: `${hero.name} wurde erfolgreich gelöscht.`,
        });
      } catch (error) {
        console.error('Fehler beim Löschen des Helden:', error);
        toast({
          title: "Fehler",
          description: "Der Held konnte nicht gelöscht werden. Bitte versuche es erneut.",
          variant: "destructive"
        });
      }
    }
  };
  
  if (isLoadingHero) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#d4af37] mb-2" />
        <p>Lade Heldendaten...</p>
      </div>
    );
  }

  if (heroError || !hero) {
    // Wenn ein Fehler auftritt oder kein Held gefunden wird, zur Dashboard-Seite umleiten
    setTimeout(() => {
      navigate("/");
      toast({
        title: "Held nicht gefunden",
        description: "Der gesuchte Held konnte nicht gefunden werden.",
        variant: "destructive"
      });
    }, 0);
    
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-400">Held nicht gefunden</p>
        <p className="text-sm text-[#f5f5f5]/60 mt-2">Du wirst zur Übersicht weitergeleitet...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      
      {/* Hero Card */}
      <div className="flex flex-col md:flex-row md:items-end gap-6 bg-gradient-to-br from-[#1e1e2f] via-[#1e1e2f] to-[#7f5af0]/10 rounded-xl p-6 border border-[#d4af37]/20">
        <div className="flex-shrink-0">
          <div className="h-28 w-28 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-[#d4af37]/60 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
            {hero.portrait ? (
              <img 
                src={hero.portrait} 
                alt={hero.name} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="h-full w-full bg-[#7f5af0]/20 flex items-center justify-center">
                <span className="text-[#f5f5f5]/40 text-xl">?</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <h2 className="font-['Cinzel_Decorative'] text-3xl md:text-4xl text-[#d4af37]">{hero.name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span>{hero.race}</span>
                <span className="text-[#d4af37]/60">•</span>
                <span>{hero.class}</span>
                {hero.age && (
                  <>
                    <span className="text-[#d4af37]/60">•</span>
                    <span>Alter: {hero.age}</span>
                  </>
                )}
                <span className="text-[#d4af37]/60">•</span>
                <span className="bg-[#7f5af0]/30 text-[#f5f5f5] px-2 py-0.5 rounded-full text-sm">Lvl {hero.level}</span>
              </div>
              <div className="mt-1 text-sm text-[#d4af37]/80">{hero.system}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/hero/${heroId}/edit`)}
                className="bg-[#1e1e2f]/80 hover:bg-[#1e1e2f] border border-[#d4af37]/40 text-[#f5f5f5] transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                <span>Bearbeiten</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="bg-[#1e1e2f]/80 hover:bg-[#1e1e2f] border border-[#7f5af0]/40 text-[#f5f5f5] transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Löschen</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hero Overview Tab Content */}
      <div className="space-y-8">
        {/* Hero Stats / Attributes */}
        {hero.stats && Object.keys(hero.stats).length > 0 && (
          <div className="bg-[#1e1e2f]/80 rounded-xl border border-[#d4af37]/30 p-5 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2720%27%20height%3D%2720%27%20viewBox%3D%270%200%2020%2020%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27%237f5af0%27%20fill-opacity%3D%270.05%27%20fill-rule%3D%27evenodd%27%3E%3Ccircle%20cx%3D%273%27%20cy%3D%273%27%20r%3D%271%27%2F%3E%3Ccircle%20cx%3D%2713%27%20cy%3D%2713%27%20r%3D%271%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
            <Accordion type="single" collapsible defaultValue="stats" className="w-full">
              <AccordionItem value="stats" className="border-0">
                <AccordionTrigger className="py-0 hover:no-underline">
                  <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37] flex items-center">
                    <span>Attribute & Statistiken</span>
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {hero.system && STATS_DEFINITIONS[hero.system as keyof typeof STATS_DEFINITIONS] ? (
                      // Zeige die Statistiken basierend auf dem Regelwerk
                      STATS_DEFINITIONS[hero.system as keyof typeof STATS_DEFINITIONS]
                        .filter(stat => hero.stats && hero.stats[stat.id] !== undefined)
                        .map(stat => (
                          <div 
                            key={stat.id} 
                            className="bg-[#7f5af0]/10 border border-[#7f5af0]/20 rounded-lg p-3 text-center"
                          >
                            <div className="text-sm text-[#f5f5f5]/70 mb-1">{stat.label}</div>
                            <div className="text-xl font-medium text-[#43ffaf]">
                              {hero.stats ? hero.stats[stat.id] : '–'}
                            </div>
                          </div>
                        ))
                    ) : (
                      // Generische Anzeige, wenn kein passendes Regelwerk gefunden wird
                      Object.entries(hero.stats || {}).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="bg-[#7f5af0]/10 border border-[#7f5af0]/20 rounded-lg p-3 text-center"
                        >
                          <div className="text-sm text-[#f5f5f5]/70 mb-1">{key}</div>
                          <div className="text-xl font-medium text-[#43ffaf]">{value}</div>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
        
        {/* Favorite NPCs Section */}
        {favoriteNpcs.length > 0 && (
          <div className="bg-[#1e1e2f]/80 rounded-xl border border-[#7f5af0]/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37]">Favorisierte NPCs</h3>
              <Button 
                variant="link" 
                className="text-[#d4af37] hover:text-[#43ffaf] flex items-center text-sm p-0"
                onClick={() => navigate(`/hero/${hero.id}/npcs`)}
              >
                <span>Alle NPCs anzeigen</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {favoriteNpcs.map((npc) => (
                <div key={npc.id} className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-[#d4af37]/40 mb-2">
                    {npc.image ? (
                      <img 
                        src={npc.image} 
                        alt={npc.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#7f5af0]/20 text-[#f5f5f5]/60">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium text-[#f5f5f5] truncate max-w-full px-1">
                    {npc.name}
                  </div>
                  <div className="text-xs text-[#d4af37]/70 truncate max-w-full px-1">
                    {npc.relationship}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Hero Backstory */}
        <div className="bg-[#1e1e2f]/80 rounded-xl border border-[#d4af37]/30 p-5 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2720%27%20height%3D%2720%27%20viewBox%3D%270%200%2020%2020%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27%237f5af0%27%20fill-opacity%3D%270.05%27%20fill-rule%3D%27evenodd%27%3E%3Ccircle%20cx%3D%273%27%20cy%3D%273%27%20r%3D%271%27%2F%3E%3Ccircle%20cx%3D%2713%27%20cy%3D%2713%27%20r%3D%271%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
          <div className="w-full">
            <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37] mb-3">Hintergrundgeschichte</h3>
            
            <div className="prose prose-sm prose-invert max-w-none">
              {/* Text-Hintergrundgeschichte */}
              {hero.backstory ? (
                <>
                  <div className="whitespace-pre-line">
                    {/* Zeige die ersten zwei Sätze immer an */}
                    {hero.backstory.split(/(?<=\.)\s+/).slice(0, 2).join(' ')}
                    {hero.backstory.split(/(?<=\.)\s+/).length > 2 && (
                      <span className="text-[#f5f5f5]/60">...</span>
                    )}
                  </div>
                  
                  {/* Klappbarer Bereich für den Rest des Textes */}
                  {hero.backstory.split(/(?<=\.)\s+/).length > 2 && (
                    <Accordion type="single" collapsible className="mt-2">
                      <AccordionItem value="backstory-full" className="border-0">
                        <AccordionTrigger className="py-0 hover:no-underline">
                          <span className="text-[#d4af37] text-sm">Mehr anzeigen</span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="whitespace-pre-line mt-2">
                            {hero.backstory.split(/(?<=\.)\s+/).slice(2).join(' ')}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </>
              ) : (
                <p>Keine Hintergrundgeschichte verfügbar.</p>
              )}
              
              {/* PDF-Hintergrundgeschichte */}
              {hero.backstoryPdf && hero.backstoryPdfName && (
                <div className="mt-4 p-3 border border-[#7f5af0]/30 rounded-lg bg-[#7f5af0]/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#d4af37]" />
                      <span className="text-sm">{hero.backstoryPdfName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a 
                        href={hero.backstoryPdf} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[#7f5af0] hover:text-[#7f5af0]/80 transition-colors text-sm"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Öffnen</span>
                      </a>
                      <a 
                        href={hero.backstoryPdf} 
                        download={hero.backstoryPdfName}
                        className="flex items-center gap-1 text-[#43ffaf] hover:text-[#43ffaf]/80 transition-colors text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>Herunterladen</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {hero.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {(typeof hero.tags === 'string' ? [hero.tags] : Array.isArray(hero.tags) ? hero.tags : []).map((tag, index) => (
                  <span 
                    key={index}
                    className={`text-xs rounded-full px-2 py-0.5 ${
                      index % 3 === 0 ? "bg-[#7f5af0]/20 border border-[#7f5af0]/40" :
                      index % 3 === 1 ? "bg-[#d4af37]/20 border border-[#d4af37]/40" :
                      "bg-[#43ffaf]/20 border border-[#43ffaf]/40"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Current Session Summary */}
        {latestSession && (
          <div className="bg-[#1e1e2f]/80 rounded-xl border border-[#d4af37]/30 p-5 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2720%27%20height%3D%2720%27%20viewBox%3D%270%200%2020%2020%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27%237f5af0%27%20fill-opacity%3D%270.05%27%20fill-rule%3D%27evenodd%27%3E%3Ccircle%20cx%3D%273%27%20cy%3D%273%27%20r%3D%271%27%2F%3E%3Ccircle%20cx%3D%2713%27%20cy%3D%2713%27%20r%3D%271%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37]">Aktuelle Session</h3>
              <span className="text-sm text-[#f5f5f5]/60">
                {format(new Date(latestSession.date), "dd.MM.yyyy", { locale: de })}
              </span>
            </div>
            <h4 className="font-medium text-[#43ffaf] mb-2">{latestSession.title}</h4>
            <p className="text-sm line-clamp-4 whitespace-pre-line">{latestSession.content}</p>
            
            <div className="mt-3">
              <Button 
                variant="link" 
                className="text-[#d4af37] hover:text-[#43ffaf] flex items-center text-sm p-0"
                onClick={() => navigate(`/hero/${hero.id}/sessions`)}
              >
                <span>Vollständige Session anzeigen</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Recent NPCs Grid */}
        {recentNpcs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37]">Wichtige NPCs</h3>
              <Button 
                variant="link" 
                className="text-[#d4af37] hover:text-[#43ffaf] flex items-center text-sm p-0"
                onClick={() => navigate(`/hero/${hero.id}/npcs`)}
              >
                <span>Alle anzeigen</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentNpcs.map((npc) => (
                <NpcCard key={npc.id} npc={npc} />
              ))}
            </div>
          </div>
        )}
        
        {/* Active Quests */}
        {activeQuests.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37]">Aktive Aufträge</h3>
              <Button 
                variant="link" 
                className="text-[#d4af37] hover:text-[#43ffaf] flex items-center text-sm p-0"
                onClick={() => navigate(`/hero/${hero.id}/quests`)}
              >
                <span>Alle anzeigen</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {activeQuests.map((quest) => (
                <QuestItem key={quest.id} quest={quest} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Delete Hero Dialog */}
      <DeleteHeroDialog
        hero={hero}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDeleted={() => {
          navigate('/');
          toast({
            title: 'Held gelöscht',
            description: `${hero.name} wurde erfolgreich gelöscht.`,
          });
        }}
      />
    </div>
  );
}
