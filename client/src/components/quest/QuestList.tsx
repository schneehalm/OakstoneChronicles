import { useState, useMemo } from "react";
import { Plus, Search, Loader2, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Quest } from "@shared/schema";
import { fetchQuestsByHeroId, deleteQuest as apiDeleteQuest } from "@/lib/api";
import QuestItem from "./QuestItem";
import QuestForm from "./QuestForm";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/ui/empty-state";

interface QuestListProps {
  heroId: string;
}

export default function QuestList({ heroId }: QuestListProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  
  // Lade Quests über die API
  const { 
    data: quests = [], 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/api/heroes', heroId, 'quests'],
    queryFn: () => fetchQuestsByHeroId(heroId)
  });
  
  // Gefilterte Quests basierend auf Suchbegriff
  const filteredQuests = useMemo(() => {
    if (searchTerm.trim() === "") {
      return quests;
    } else {
      const term = searchTerm.toLowerCase();
      return quests.filter(
        (quest) => 
          quest.title.toLowerCase().includes(term) || 
          quest.description.toLowerCase().includes(term)
      );
    }
  }, [quests, searchTerm]);
  
  const handleAddQuest = () => {
    setSelectedQuest(null);
    setIsFormOpen(true);
  };
  
  const handleEditQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsFormOpen(true);
  };
  
  const handleDeleteQuest = async (quest: Quest) => {
    if (window.confirm(`Bist du sicher, dass du den Auftrag "${quest.title}" löschen möchtest?`)) {
      try {
        await apiDeleteQuest(quest.id.toString(), heroId);
        
        toast({
          title: "Auftrag gelöscht",
          description: `"${quest.title}" wurde erfolgreich gelöscht.`,
        });
      } catch (error) {
        console.error("Fehler beim Löschen des Auftrags:", error);
        toast({
          title: "Fehler",
          description: "Der Auftrag konnte nicht gelöscht werden.",
          variant: "destructive",
        });
      }
    }
  };
  
  const handleFormSubmit = () => {
    // Invalidiere den Cache, um die Daten neu zu laden
    queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroId, 'quests'] });
    
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
        <p className="text-red-500">Fehler beim Laden der Aufträge: {error instanceof Error ? error.message : 'Unbekannter Fehler'}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37]">
          Aufträge
        </h2>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Input
              placeholder="Suche nach Aufträgen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 form-input"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#7f5af0]/60" />
          </div>
          <Button
            onClick={handleAddQuest}
            className="SecondaryButtonOutlined"
          >
            <Plus className="h-5 w-5 mr-1" />
            Auftrag
          </Button>
        </div>
      </div>
      
      {filteredQuests.length === 0 ? (
        searchTerm ? (
          <EmptyState 
            title="Keine Aufträge gefunden."
            hasFilter={true}
            filterDescription="Versuche eine andere Suche oder"
            onClearFilter={() => setSearchTerm("")}
          />
        ) : (
          <EmptyState 
            title="Du hast noch keine Aufträge erstellt."
            icon={<MapPinIcon className="empty-state-icon" />}
            actionLabel="Ersten Auftrag erstellen"
            onAction={handleAddQuest}
          />
        )
      ) : (
        <div className="space-y-3">
          {filteredQuests.map((quest) => (
            <div key={quest.id} className="group relative">
              <QuestItem 
                quest={quest} 
                onClick={() => handleEditQuest(quest)}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteQuest(quest);
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
              {selectedQuest ? "Auftrag bearbeiten" : "Neuen Auftrag erstellen"}
            </DialogTitle>
          </DialogHeader>
          <QuestForm 
            heroId={heroId} 
            existingQuest={selectedQuest} 
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}