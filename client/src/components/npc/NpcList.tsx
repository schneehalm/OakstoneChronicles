import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Npc } from "@/lib/types";
import { getNpcsByHeroId, deleteNpc } from "@/lib/storage";
import NpcCard from "./NpcCard";
import NpcForm from "./NpcForm";
import { useToast } from "@/hooks/use-toast";

interface NpcListProps {
  heroId: string;
}

export default function NpcList({ heroId }: NpcListProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [filteredNpcs, setFilteredNpcs] = useState<Npc[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNpc, setSelectedNpc] = useState<Npc | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  useEffect(() => {
    // Load NPCs
    const loadNpcs = () => {
      const npcData = getNpcsByHeroId(heroId);
      setNpcs(npcData);
      setFilteredNpcs(npcData);
    };
    
    loadNpcs();
  }, [heroId]);
  
  useEffect(() => {
    // Filter NPCs based on search term
    if (searchTerm.trim() === "") {
      setFilteredNpcs(npcs);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = npcs.filter(
        npc => 
          npc.name.toLowerCase().includes(term) || 
          (npc.notes && npc.notes.toLowerCase().includes(term)) ||
          (npc.location && npc.location.toLowerCase().includes(term))
      );
      setFilteredNpcs(filtered);
    }
  }, [searchTerm, npcs]);
  
  const handleAddNpc = () => {
    setSelectedNpc(null);
    setIsFormOpen(true);
  };
  
  const handleEditNpc = (npc: Npc) => {
    setSelectedNpc(npc);
    setIsFormOpen(true);
  };
  
  const handleDeleteNpc = (npc: Npc) => {
    if (window.confirm(`Bist du sicher, dass du "${npc.name}" löschen möchtest?`)) {
      deleteNpc(npc.id);
      
      // Update NPC list
      const updatedNpcs = npcs.filter(n => n.id !== npc.id);
      setNpcs(updatedNpcs);
      
      toast({
        title: "NPC gelöscht",
        description: `${npc.name} wurde erfolgreich gelöscht.`,
      });
    }
  };
  
  const handleFormSubmit = () => {
    // Reload NPCs
    const npcData = getNpcsByHeroId(heroId);
    setNpcs(npcData);
    setFilteredNpcs(npcData);
    
    // Close form
    setIsFormOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37]">
          NPCs
        </h2>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Input
              placeholder="Suche nach NPCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#7f5af0]/60" />
          </div>
          <Button
            onClick={handleAddNpc}
            className="bg-[#7f5af0] hover:bg-[#7f5af0]/90 text-white"
          >
            <Plus className="h-5 w-5 mr-1" />
            NPC
          </Button>
        </div>
      </div>
      
      {filteredNpcs.length === 0 ? (
        <div className="text-center py-10 bg-[#1e1e2f]/50 rounded-xl border border-[#7f5af0]/20">
          {searchTerm ? (
            <p className="text-[#f5f5f5]/70">Keine NPCs gefunden. Versuche eine andere Suche.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-[#f5f5f5]/70">Du hast noch keine NPCs erstellt.</p>
              <Button
                onClick={handleAddNpc}
                variant="outline"
                className="border-[#7f5af0]/40 text-[#7f5af0]"
              >
                Ersten NPC erstellen
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNpcs.map((npc) => (
            <div key={npc.id} className="group relative">
              <NpcCard 
                npc={npc} 
                onClick={() => handleEditNpc(npc)}
              />
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNpc(npc);
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
              {selectedNpc ? "NPC bearbeiten" : "Neuen NPC erstellen"}
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 -mr-1">
            <NpcForm 
              heroId={heroId} 
              existingNpc={selectedNpc} 
              onSubmit={handleFormSubmit}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
