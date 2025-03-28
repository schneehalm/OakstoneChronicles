import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Quest } from "@/lib/types";
import { getQuestsByHeroId, deleteQuest } from "@/lib/storage";
import QuestItem from "./QuestItem";
import QuestForm from "./QuestForm";
import { useToast } from "@/hooks/use-toast";

interface QuestListProps {
  heroId: string;
}

export default function QuestList({ heroId }: QuestListProps) {
  const { toast } = useToast();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [filteredQuests, setFilteredQuests] = useState<Quest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    // Load quests
    const loadQuests = () => {
      const questData = getQuestsByHeroId(heroId);
      setQuests(questData);
      setFilteredQuests(questData);
    };
    
    loadQuests();
  }, [heroId]);
  
  useEffect(() => {
    // Filter quests based on search term
    if (searchTerm.trim() === "") {
      setFilteredQuests(quests);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = quests.filter(
        quest => 
          quest.title.toLowerCase().includes(term) || 
          quest.description.toLowerCase().includes(term)
      );
      setFilteredQuests(filtered);
    }
  }, [searchTerm, quests]);
  
  const handleAddQuest = () => {
    setSelectedQuest(null);
    setIsFormOpen(true);
  };
  
  const handleEditQuest = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsFormOpen(true);
  };
  
  const handleDeleteQuest = (quest: Quest) => {
    if (window.confirm(`Bist du sicher, dass du den Auftrag "${quest.title}" löschen möchtest?`)) {
      deleteQuest(quest.id);
      
      // Update quest list
      const updatedQuests = quests.filter(q => q.id !== quest.id);
      setQuests(updatedQuests);
      
      toast({
        title: "Auftrag gelöscht",
        description: `"${quest.title}" wurde erfolgreich gelöscht.`,
      });
    }
  };
  
  const handleFormSubmit = () => {
    // Reload quests
    const questData = getQuestsByHeroId(heroId);
    setQuests(questData);
    setFilteredQuests(questData);
    
    // Close form
    setIsFormOpen(false);
  };
  
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
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#7f5af0]/60" />
          </div>
          <Button
            onClick={handleAddQuest}
            className="bg-[#7f5af0] hover:bg-[#7f5af0]/90 text-white"
          >
            <Plus className="h-5 w-5 mr-1" />
            Auftrag
          </Button>
        </div>
      </div>
      
      {filteredQuests.length === 0 ? (
        <div className="text-center py-10 bg-[#1e1e2f]/50 rounded-xl border border-[#7f5af0]/20">
          {searchTerm ? (
            <p className="text-[#f5f5f5]/70">Keine Aufträge gefunden. Versuche eine andere Suche.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-[#f5f5f5]/70">Du hast noch keine Aufträge erstellt.</p>
              <Button
                onClick={handleAddQuest}
                variant="outline"
                className="border-[#7f5af0]/40 text-[#7f5af0]"
              >
                Ersten Auftrag erstellen
              </Button>
            </div>
          )}
        </div>
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
        <DialogContent className="bg-[#1e1e2f] border border-[#7f5af0]/30 text-[#f5f5f5] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="font-['Cinzel_Decorative'] text-[#d4af37] text-xl">
              {selectedQuest ? "Auftrag bearbeiten" : "Neuen Auftrag erstellen"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 -mr-1">
            <QuestForm 
              heroId={heroId} 
              existingQuest={selectedQuest} 
              onSubmit={handleFormSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
