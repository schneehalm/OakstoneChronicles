import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Npc } from "@/lib/types";
import { RELATIONSHIP_TYPES } from "@/lib/theme";
import { getNpcsByHeroId, deleteNpc } from "@/lib/storage";
import NpcCard from "./NpcCard";
import NpcForm from "./NpcForm";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface NpcListProps {
  heroId: string;
}

export default function NpcList({ heroId }: NpcListProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [filteredNpcs, setFilteredNpcs] = useState<Npc[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [relationshipFilter, setRelationshipFilter] = useState<string>("all");
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
    // Filter NPCs based on search term and relationship
    let filtered = npcs;
    
    // Filter by relationship if not "all"
    if (relationshipFilter !== "all") {
      filtered = filtered.filter(npc => npc.relationship === relationshipFilter);
    }
    
    // Then filter by search term
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        npc => 
          npc.name.toLowerCase().includes(term) || 
          (npc.notes && npc.notes.toLowerCase().includes(term)) ||
          (npc.location && npc.location.toLowerCase().includes(term))
      );
    }
    
    setFilteredNpcs(filtered);
  }, [searchTerm, relationshipFilter, npcs]);
  
  // Count NPCs by relationship type
  const relationshipCounts = npcs.reduce((counts, npc) => {
    const rel = npc.relationship || 'neutral';
    counts[rel] = (counts[rel] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  
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
  
  // Get the relationship label based on value
  const getRelationshipLabel = (value: string) => {
    const relationship = RELATIONSHIP_TYPES.find(r => r.value === value);
    return relationship ? relationship.label : value;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37]">
          NPCs
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-grow sm:w-64">
            <Input
              placeholder="Suche nach NPCs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 form-input"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-[#7f5af0]/60" />
          </div>
          
          <div className="flex-shrink-0 relative min-w-[180px]">
            <Select
              value={relationshipFilter}
              onValueChange={setRelationshipFilter}
            >
              <SelectTrigger className="select-trigger h-10 pl-10">
                <SelectValue placeholder="Beziehung wählen" />
              </SelectTrigger>
              <SelectContent className="select-content">
                <SelectItem value="all">
                  <span className="flex justify-between w-full">
                    <span>Alle Beziehungen</span>
                    <Badge variant="outline" className="ml-2">{npcs.length}</Badge>
                  </span>
                </SelectItem>
                {RELATIONSHIP_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} disabled={!relationshipCounts[type.value]}>
                    <span className="flex justify-between w-full">
                      <span>{type.label}</span>
                      {relationshipCounts[type.value] && (
                        <Badge variant="outline" className="ml-2">{relationshipCounts[type.value]}</Badge>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-[#7f5af0]/60" />
          </div>
          
          <Button
            onClick={handleAddNpc}
            className="btn-accent"
          >
            <Plus className="h-5 w-5 mr-1" />
            NPC
          </Button>
        </div>
      </div>
      
      {/* Relationship filter badges for mobile */}
      <div className="flex flex-wrap gap-2 md:hidden">
        <span 
          className={`filter-chip ${relationshipFilter === "all" ? "active" : ""}`}
          onClick={() => setRelationshipFilter("all")}
        >
          Alle ({npcs.length})
        </span>
        {RELATIONSHIP_TYPES.map((type) => (
          relationshipCounts[type.value] ? (
            <span 
              key={type.value}
              className={`filter-chip ${relationshipFilter === type.value ? "active" : ""}`}
              onClick={() => setRelationshipFilter(type.value)}
            >
              {type.label} ({relationshipCounts[type.value]})
            </span>
          ) : null
        ))}
      </div>
      
      {relationshipFilter !== "all" && (
        <div className="info-box">
          <p className="text-sm">
            <span className="font-semibold highlight">Filter aktiv:</span>{" "}
            Beziehung = {getRelationshipLabel(relationshipFilter)}
            {filteredNpcs.length ? ` (${filteredNpcs.length} NPCs)` : ''}
            <Button 
              variant="link" 
              size="sm"
              onClick={() => setRelationshipFilter("all")}
              className="ml-2 p-0 h-auto"
            >
              Filter zurücksetzen
            </Button>
          </p>
        </div>
      )}
      
      {filteredNpcs.length === 0 ? (
        <div className="text-center py-10 content-box">
          {searchTerm || relationshipFilter !== "all" ? (
            <p className="empty-state">
              Keine NPCs gefunden. 
              {relationshipFilter !== "all" && " Versuche einen anderen Beziehungsfilter oder "}
              {searchTerm && " Versuche eine andere Suche oder "}
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm("");
                  setRelationshipFilter("all");
                }}
                className="p-0"
              >
                setze alle Filter zurück
              </Button>.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="empty-state">Du hast noch keine NPCs erstellt.</p>
              <Button
                onClick={handleAddNpc}
                className="btn-accent"
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
        <DialogContent className="dialog-content">
          <DialogHeader>
            <DialogTitle className="content-heading">
              {selectedNpc ? "NPC bearbeiten" : "Neuen NPC erstellen"}
            </DialogTitle>
          </DialogHeader>
          <NpcForm 
            heroId={heroId} 
            existingNpc={selectedNpc} 
            onSubmit={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
