import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Session } from "@/lib/types";
import { getSessionsByHeroId, deleteSession } from "@/lib/storage";
import SessionCard from "./SessionCard";
import SessionForm from "./SessionForm";
import { useToast } from "@/hooks/use-toast";

interface SessionListProps {
  heroId: string;
}

export default function SessionList({ heroId }: SessionListProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    // Load sessions
    const loadSessions = () => {
      const sessionData = getSessionsByHeroId(heroId);
      setSessions(sessionData);
      setFilteredSessions(sessionData);
    };
    
    loadSessions();
  }, [heroId]);
  
  useEffect(() => {
    // Filter sessions based on search term
    if (searchTerm.trim() === "") {
      setFilteredSessions(sessions);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = sessions.filter(
        session => 
          session.title.toLowerCase().includes(term) || 
          session.content.toLowerCase().includes(term) ||
          session.tags.some(tag => tag.toLowerCase().includes(term))
      );
      setFilteredSessions(filtered);
    }
  }, [searchTerm, sessions]);
  
  const handleAddSession = () => {
    setSelectedSession(null);
    setIsFormOpen(true);
  };
  
  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setIsFormOpen(true);
  };
  
  const handleDeleteSession = (session: Session) => {
    if (window.confirm(`Bist du sicher, dass du die Session "${session.title}" löschen möchtest?`)) {
      deleteSession(session.id);
      
      // Update session list
      const updatedSessions = sessions.filter(s => s.id !== session.id);
      setSessions(updatedSessions);
      
      toast({
        title: "Session gelöscht",
        description: `"${session.title}" wurde erfolgreich gelöscht.`,
      });
    }
  };
  
  const handleFormSubmit = () => {
    // Reload sessions
    const sessionData = getSessionsByHeroId(heroId);
    setSessions(sessionData);
    setFilteredSessions(sessionData);
    
    // Close form
    setIsFormOpen(false);
  };
  
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
        <div className="text-center py-10 bg-[#1e1e2f]/50 rounded-xl border border-[#7f5af0]/20">
          {searchTerm ? (
            <p className="text-[#f5f5f5]/70">Keine Sessions gefunden. Versuche eine andere Suche.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-[#f5f5f5]/70">Du hast noch keine Sessions aufgezeichnet.</p>
              <Button
                onClick={handleAddSession}
                variant="outline"
                className="border-[#7f5af0]/40 text-[#7f5af0]"
              >
                Erste Session erstellen
              </Button>
            </div>
          )}
        </div>
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
        <DialogContent className="bg-[#1e1e2f] border border-[#7f5af0]/30 text-[#f5f5f5] max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-['Cinzel_Decorative'] text-[#d4af37] text-xl">
              {selectedSession ? "Session bearbeiten" : "Neue Session erstellen"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 -mr-1">
            <SessionForm 
              heroId={heroId} 
              existingSession={selectedSession} 
              onSubmit={handleFormSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
