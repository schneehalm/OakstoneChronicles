import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, Plus, X, Users, UserPlus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Session, Npc } from "@shared/schema";
import { createSession, updateSession, fetchNpcsByHeroId, updateNpc } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NpcForm from "@/components/npc/NpcForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SessionFormProps {
  heroId: number;
  existingSession?: Session | null;
  onSubmit: () => void;
}

export default function SessionForm({ heroId, existingSession, onSubmit }: SessionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Vorbereitete Tags, basierend auf dem existierenden Session-Objekt
  const existingTags = existingSession?.tags 
    ? (Array.isArray(existingSession.tags) 
        ? existingSession.tags 
        : typeof existingSession.tags === 'string' && existingSession.tags
          ? existingSession.tags.split(',')
          : [])
    : [];
  
  const [tags, setTags] = useState<string[]>(existingTags);
  const [newTag, setNewTag] = useState("");
  const [date, setDate] = useState<Date>(
    existingSession ? new Date(existingSession.date) : new Date()
  );
  
  // NPC-bezogene States
  const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
  const [isNpcFormOpen, setIsNpcFormOpen] = useState(false);
  
  // Lade NPCs für diesen Helden über die API
  const { 
    data: npcs = [], 
    isLoading: isLoadingNpcs,
    error: npcsError
  } = useQuery({
    queryKey: ['/api/heroes', heroId, 'npcs'],
    queryFn: () => fetchNpcsByHeroId(heroId)
  });
  
  // Mutation für Session-Erstellung/Aktualisierung
  const sessionMutation = useMutation({
    mutationFn: async (data: Partial<Session>) => {
      // Stellen Sie sicher, dass heroId als Zahl verwendet wird
      const heroIdAsNumber = typeof heroId === 'string' ? parseInt(heroId) : heroId;
      
      if (existingSession) {
        // Stelle sicher, dass existingSession.id als Zahl übergeben wird
        const sessionId = typeof existingSession.id === 'string' ? 
          parseInt(existingSession.id) : existingSession.id;
        return updateSession(sessionId, data);
      } else {
        return createSession(heroIdAsNumber, data as Omit<Session, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>);
      }
    },
    onSuccess: async (savedSession) => {
      // Aktualisiere die NPCs, wenn sie dieser Session zugeordnet werden sollen
      for (const npc of npcs) {
        const isSelected = selectedNpcs.includes(npc.id.toString());
        // Bei Vergleich von firstSessionId mit existingSession.id immer toString() verwenden, um Typkonflikte zu vermeiden
        const wasAlreadyAssigned = existingSession && 
          npc.firstSessionId !== null && 
          npc.firstSessionId !== undefined && 
          npc.firstSessionId.toString() === existingSession.id.toString();
        
        // Stelle sicher, dass npc.id als Zahl verwendet wird
        const npcId = typeof npc.id === 'string' ? parseInt(npc.id) : npc.id;
        
        // Verarbeite savedSession.id typgerecht
        const sessionId = savedSession.id;
        
        if (isSelected && !wasAlreadyAssigned) {
          // Ordne NPC dieser Session zu
          await updateNpc(npcId, {
            ...npc,
            firstSessionId: typeof sessionId === 'number' ? sessionId : 
              sessionId ? parseInt(sessionId.toString()) : null
          });
        } else if (!isSelected && wasAlreadyAssigned) {
          // Entferne Zuordnung
          await updateNpc(npcId, {
            ...npc,
            firstSessionId: null
          });
        }
      }
      
      // Sicher heroId als Zahl verwenden
      const heroIdAsNumber = typeof heroId === 'string' ? parseInt(heroId) : heroId;
      
      // Invalidiere Caches
      queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroIdAsNumber, 'sessions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroIdAsNumber, 'npcs'] });
      
      toast({
        title: existingSession ? "Session aktualisiert" : "Session erstellt",
        description: `"${savedSession.title}" wurde erfolgreich ${existingSession ? 'aktualisiert' : 'erstellt'}.`,
      });
      
      // Callback aufrufen
      onSubmit();
    },
    onError: (error) => {
      console.error("Fehler beim Speichern der Session:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  });
  
  // Konvertiere heroId in eine Zahl, falls es ein String ist
  const heroIdAsNumber = typeof heroId === 'string' ? parseInt(heroId) : heroId;
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Session>({
    defaultValues: {
      // Stellen Sie sicher, dass heroId als Zahl übergeben wird
      id: existingSession?.id || undefined,
      heroId: existingSession?.heroId || heroIdAsNumber,
      title: existingSession?.title || '',
      date: existingSession?.date || new Date().toISOString(),
      content: existingSession?.content || '',
      tags: existingTags,
      createdAt: existingSession?.createdAt || new Date().toISOString(),
      updatedAt: existingSession?.updatedAt || new Date().toISOString()
    }
  });
  
  useEffect(() => {
    // Stellt sicher, dass das Tags-Feld aktualisiert wird, wenn sich die Tags ändern
    setValue('tags', tags);
  }, [tags, setValue]);
  
  useEffect(() => {
    // Stellt sicher, dass das Datum-Feld aktualisiert wird, wenn sich das Datum ändert
    setValue('date', date.toISOString());
  }, [date, setValue]);
  
  // Wähle NPCs vor, die dieser Session zugeordnet sind
  useEffect(() => {
    if (existingSession && npcs.length > 0) {
      const sessionNpcs = npcs.filter(npc => 
        npc.firstSessionId !== undefined && 
        npc.firstSessionId !== null && 
        npc.firstSessionId.toString() === existingSession.id.toString()
      );
      
      setSelectedNpcs(sessionNpcs.map(npc => npc.id.toString()));
    }
  }, [existingSession, npcs]);
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const toggleNpcSelection = (npcId: string) => {
    setSelectedNpcs(prevSelected => 
      prevSelected.includes(npcId)
        ? prevSelected.filter(id => id !== npcId)
        : [...prevSelected, npcId]
    );
  };
  
  const handleNpcFormSubmitted = () => {
    // Sicher heroId als Zahl verwenden
    const heroIdAsNumber = typeof heroId === 'string' ? parseInt(heroId) : heroId;
    
    // Invalidiere den Cache, um die NPCs neu zu laden
    queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroIdAsNumber, 'npcs'] });
    
    // Schließe das NPC-Formular
    setIsNpcFormOpen(false);
    
    // Toast-Nachricht anzeigen
    toast({
      title: "NPC hinzugefügt",
      description: "Der NPC wurde erstellt und für diese Session ausgewählt.",
    });
  };
  
  const handleFormSubmit = (data: Session) => {
    try {
      // Stelle sicher, dass Tags und Datum enthalten sind
      data.tags = tags.join(',');
      data.date = date.toISOString();
      
      // Session speichern über Mutation
      sessionMutation.mutate(data);
    } catch (error) {
      console.error("Fehler beim Speichern der Session:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Session Title */}
      <div>
        <Label htmlFor="title" className="form-label">Titel *</Label>
        <Input
          id="title"
          placeholder="Titel der Session"
          className="form-input"
          {...register('title', { required: true })}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">Titel ist erforderlich</p>}
      </div>
      
      {/* Session Date */}
      <div>
        <Label htmlFor="date" className="form-label">Datum</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal form-input",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: de }) : <span>Datum wählen</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-card border-border dropdown-content">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => setDate(newDate || new Date())}
              initialFocus
              locale={de}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Session Content */}
      <div>
        <Label htmlFor="content" className="form-label">Inhalt *</Label>
        <Textarea
          id="content"
          placeholder="Was ist in dieser Session passiert?"
          className="form-textarea"
          rows={8}
          {...register('content', { required: true })}
        />
        {errors.content && <p className="text-red-500 text-xs mt-1">Inhalt ist erforderlich</p>}
      </div>
      
      {/* Tags */}
      <div>
        <Label className="block mb-2 form-label">Tags</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <div 
              key={index}
              className={`${
                index % 3 === 0 ? "bg-[#7f5af0]/20 border-[#7f5af0]/40" :
                index % 3 === 1 ? "bg-[#d4af37]/20 border-[#d4af37]/40" :
                "bg-[#43ffaf]/20 border-[#43ffaf]/40"
              } border rounded-full px-3 py-1 text-sm flex items-center`}
            >
              <span>{tag}</span>
              <button 
                type="button"
                className={`ml-2 ${
                  index % 3 === 0 ? "text-[#7f5af0]/70 hover:text-[#7f5af0]" :
                  index % 3 === 1 ? "text-[#d4af37]/70 hover:text-[#d4af37]" :
                  "text-[#43ffaf]/70 hover:text-[#43ffaf]"
                }`}
                onClick={() => removeTag(tag)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Tag hinzufügen (z.B. Bossfight, Plot Twist)"
            className="flex-grow form-input"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button 
            type="button" 
            variant="outline"
            onClick={addTag}
            className="SecondaryButtonOutlined px-4 py-2 flex items-center"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* NPCs Section */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label className="block form-label">NPCs in dieser Session</Label>
          <Button 
            type="button" 
            variant="outline"
            onClick={() => setIsNpcFormOpen(true)}
            className="PrimaryButtonOutlined px-3 py-1 h-8 text-xs flex items-center"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            Neuer NPC
          </Button>
        </div>
        
        {isLoadingNpcs ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-[#7f5af0]" />
          </div>
        ) : npcs.length === 0 ? (
          <div className="text-sm text-muted-foreground py-2">
            Es wurden noch keine NPCs für diesen Helden erstellt. Erstelle NPCs, um sie dieser Session zuzuordnen.
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-border rounded-lg bg-card">
            {npcs.map((npc) => (
              <div 
                key={npc.id}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <Checkbox 
                  id={`npc-${npc.id}`}
                  checked={selectedNpcs.includes(npc.id.toString())}
                  onCheckedChange={() => toggleNpcSelection(npc.id.toString())}
                  className="border-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
                />
                <label 
                  htmlFor={`npc-${npc.id}`}
                  className="text-sm font-medium leading-none cursor-pointer flex-1"
                >
                  {npc.name} 
                  {npc.firstSessionId && existingSession && 
                   npc.firstSessionId.toString() !== existingSession.id.toString() && 
                    <span className="ml-1 text-xs text-muted-foreground">(Anderer Session zugeordnet)</span>
                  }
                  {npc.firstSessionId && existingSession && 
                   npc.firstSessionId.toString() === existingSession.id.toString() && 
                    <span className="ml-1 text-xs text-secondary/70">(Dieser Session zugeordnet)</span>
                  }
                </label>
                <span className="text-xs text-muted-foreground">{npc.relationship}</span>
              </div>
            ))}
          </div>
        )}
        
        {selectedNpcs.length > 0 && existingSession && (
          <div className="text-xs text-secondary">
            <Users className="inline-block w-3.5 h-3.5 mr-1" />
            {selectedNpcs.length} NPC{selectedNpcs.length > 1 ? 's' : ''} ausgewählt. 
            Diese werden mit dieser Session verknüpft.
          </div>
        )}
        
        {selectedNpcs.length > 0 && !existingSession && (
          <div className="text-xs text-secondary">
            <Users className="inline-block w-3.5 h-3.5 mr-1" />
            {selectedNpcs.length} NPC{selectedNpcs.length > 1 ? 's' : ''} ausgewählt. 
            Diese werden als in dieser Session "erstmalig getroffen" markiert.
          </div>
        )}
        
        {/* NPC Form Dialog */}
        <Dialog 
          open={isNpcFormOpen} 
          onOpenChange={(open) => {
            // Wenn der Dialog geschlossen wird, ohne dass der NPC erstellt wurde
            if (!open) {
              setIsNpcFormOpen(false);
            }
          }}
        >
          <DialogContent className="dialog-content bg-card border-border text-foreground max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-secondary">Neuen NPC erstellen</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Erstelle einen neuen NPC, der in dieser Session vorkommt.
              </p>
            </DialogHeader>
            <NpcForm 
              heroId={heroId} 
              existingNpc={null} 
              onSubmit={handleNpcFormSubmitted} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Buttons */}
      <div className="sticky bottom-0 bg-[#1e1e2f] border-t border-[#7f5af0]/30 mt-6 -mx-6 px-6 py-4 flex justify-end gap-2">
        <Button 
          type="submit" 
          className="PrimaryButton"
          disabled={sessionMutation.isPending}
        >
          {sessionMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {existingSession ? "Wird aktualisiert..." : "Wird erstellt..."}
            </>
          ) : (
            existingSession ? "Aktualisieren" : "Erstellen"
          )}
        </Button>
      </div>
    </form>
  );
}