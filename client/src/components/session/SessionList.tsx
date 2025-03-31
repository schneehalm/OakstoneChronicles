import { useState, useMemo } from "react";
import { Plus, Search, Loader2, ScrollTextIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Session } from "@shared/schema";
import { fetchSessionsByHeroId, deleteSession as apiDeleteSession } from "@/lib/api";
import SessionCard from "./SessionCard";
import SessionForm from "./SessionForm";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/empty-state";

interface SessionListProps {
  heroId: string;
}

export default function SessionList({ heroId }: SessionListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Lade Sessions über die API
  const { 
    data: sessions = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/heroes', heroId, 'sessions'],
    queryFn: () => fetchSessionsByHeroId(heroId)
  });
  
  // Gefilterte Sessions basierend auf Suchbegriff
  const filteredSessions = useMemo(() => {
    if (searchTerm.trim() === "") {
      return sessions;
    } else {
      const term = searchTerm.toLowerCase();
      return sessions.filter(
        (session) => 
          session.title.toLowerCase().includes(term) || 
          session.content.toLowerCase().includes(term) ||
          (Array.isArray(session.tags) 
            ? session.tags.some((tag) => typeof tag === 'string' && tag.toLowerCase().includes(term))
            : typeof session.tags === 'string' && session.tags.toLowerCase().includes(term)
          )
      );
    }
  }, [sessions, searchTerm]);
  
  const handleAddSession = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  };
  
  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };
  
  const handleDeleteSession = async (session: Session) => {
    if (window.confirm(`Bist du sicher, dass du die Session "${session.title}" löschen möchtest?`)) {
      try {
        await apiDeleteSession(session.id.toString(), heroId);
        
        // Die Cache-Invalidierung wird vom API-Aufruf erledigt, 
        // aber wir aktualisieren die UI optimistisch
        
        toast({
          title: "Session gelöscht",
          description: `"${session.title}" wurde erfolgreich gelöscht.`,
        });
      } catch (error) {
        console.error("Fehler beim Löschen der Session:", error);
        toast({
          title: "Fehler",
          description: "Die Session konnte nicht gelöscht werden.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleFormSubmit = () => {
    // Invalidiere den Cache, um die Daten neu zu laden
    queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'sessions'] });
    
    // Schließe das Formular
    setIsFormOpen(false);
  };
  
  // Zeige Ladestatus
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#7f5af0]" />
      </div>
    );
  }
  
  // Zeige Fehlerfall
  if (error) {
    return (
      <div className="text-center py-10 bg-red-500/10 rounded-xl border border-red-500/30">
        <p className="text-red-500">Fehler beim Laden der Sessions: {error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37]">
          Sessions
        </h2>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Input
              placeholder="Suche nach Sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#7f5af0]/60" />
          </div>
          <Button
            onClick={handleAddSession}
            className="bg-[#7f5af0] hover:bg-[#7f5af0]/90 text-white"
          >
            <Plus className="h-5 w-5 mr-1" />
            Session
          </Button>
        </div>
      </div>
      
      {filteredSessions.length === 0 ? (
        searchTerm ? (
          <EmptyState 
            title="Keine Sessions gefunden."
            hasFilter={true}
            filterDescription="Versuche eine andere Suche oder"
            onClearFilter={() => setSearchTerm("")}
          />
        ) : (
          <EmptyState 
            title="Du hast noch keine Sessions aufgezeichnet."
            icon={<ScrollTextIcon className="empty-state-icon" />}
            actionLabel="Erste Session erstellen"
            onAction={handleAddSession}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <div key={session.id} className="group relative">
              <SessionCard 
                session={session} 
                onClick={() => handleEditSession(session)}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSession(session);
                  }}
                  className="h-7 w-7 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-[#1e1e2f] border border-[#7f5af0]/30 text-[#f5f5f5] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-['Cinzel_Decorative'] text-[#d4af37] text-xl">
              {selectedSession ? "Session bearbeiten" : "Neue Session erstellen"}
            </DialogTitle>
          </DialogHeader>
          <SessionForm 
            heroId={heroId} 
            existingSession={selectedSession} 
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}