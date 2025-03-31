import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, Plus, X, Users, UserPlus } from "lucide-react";
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
import { Session, Npc } from "@/lib/types";
import { saveSession, getNpcsByHeroId, saveNpc } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import NpcForm from "@/components/npc/NpcForm";

interface SessionFormProps {
  heroId: string;
  existingSession?: Session | null;
  onSubmit: () => void;
}

export default function SessionForm({ heroId, existingSession, onSubmit }: SessionFormProps) {
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>(existingSession?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [date, setDate] = useState<Date>(
    existingSession ? new Date(existingSession.date) : new Date()
  );
  
  // NPC-bezogene States
  const [npcs, setNpcs] = useState<Npc[]>([]);
  const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
  const [isNpcFormOpen, setIsNpcFormOpen] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Session>({
    defaultValues: {
      id: existingSession?.id || '',
      heroId: heroId,
      title: existingSession?.title || '',
      date: existingSession?.date || new Date().toISOString(),
      content: existingSession?.content || '',
      tags: existingSession?.tags || [],
      createdAt: existingSession?.createdAt || '',
      updatedAt: existingSession?.updatedAt || ''
    }
  });
  
  useEffect(() => {
    // Ensure the tags field is updated when tags change
    setValue('tags', tags);
  }, [tags, setValue]);
  
  useEffect(() => {
    // Ensure the date field is updated when date changes
    setValue('date', date.toISOString());
  }, [date, setValue]);
  
  // Lade NPCs für diesen Helden
  useEffect(() => {
    if (heroId) {
      const heroNpcs = getNpcsByHeroId(heroId);
      setNpcs(heroNpcs);
    }
  }, [heroId]);
  
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
    // Aktualisiere die NPC-Liste und schließe das Formular
    setIsNpcFormOpen(false);
    const updatedNpcs = getNpcsByHeroId(heroId);
    setNpcs(updatedNpcs);
  };
  
  const handleFormSubmit = (data: Session) => {
    try {
      // Make sure tags and date are included
      data.tags = tags;
      data.date = date.toISOString();
      
      // Save session
      const savedSession = saveSession(data);
      
      // Update NPCs to set this session as their first encounter
      if (!existingSession && selectedNpcs.length > 0) {
        selectedNpcs.forEach(npcId => {
          const npc = npcs.find(n => n.id === npcId);
          if (npc && !npc.firstSessionId) {
            // Nur setzen, wenn der NPC noch keine erste Session hat
            saveNpc({
              ...npc,
              firstSessionId: savedSession.id
            });
          }
        });
      }
      
      toast({
        title: existingSession ? "Session aktualisiert" : "Session erstellt",
        description: `"${data.title}" wurde erfolgreich ${existingSession ? 'aktualisiert' : 'erstellt'}.`,
      });
      
      // Call onSubmit callback
      onSubmit();
    } catch (error) {
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
        <Label htmlFor="title">Titel *</Label>
        <Input
          id="title"
          placeholder="Titel der Session"
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          {...register('title', { required: true })}
        />
        {errors.title && <p className="text-red-500 text-xs mt-1">Titel ist erforderlich</p>}
      </div>
      
      {/* Session Date */}
      <div>
        <Label htmlFor="date">Datum</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal bg-[#1e1e2f] border border-[#7f5af0]/40",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: de }) : <span>Datum wählen</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-[#1e1e2f] border border-[#7f5af0]/40">
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
        <Label htmlFor="content">Inhalt *</Label>
        <Textarea
          id="content"
          placeholder="Was ist in dieser Session passiert?"
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          rows={8}
          {...register('content', { required: true })}
        />
        {errors.content && <p className="text-red-500 text-xs mt-1">Inhalt ist erforderlich</p>}
      </div>
      
      {/* Tags */}
      <div>
        <Label className="block mb-2">Tags</Label>
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
            className="flex-grow bg-[#1e1e2f] border border-[#7f5af0]/40"
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
            className="px-4 py-2 bg-[#7f5af0]/20 hover:bg-[#7f5af0]/30 border border-[#7f5af0]/40 rounded-lg transition-colors flex items-center"
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* NPCs Section */}
      {!existingSession && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="block">NPCs in dieser Session</Label>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setIsNpcFormOpen(true)}
              className="px-3 py-1 h-8 bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/40 rounded-lg transition-colors text-xs flex items-center"
            >
              <UserPlus className="h-3.5 w-3.5 mr-1" />
              Neuer NPC
            </Button>
          </div>
          
          {npcs.length === 0 ? (
            <div className="text-sm text-[#f5f5f5]/60 py-2">
              Es wurden noch keine NPCs für diesen Helden erstellt. Erstelle NPCs, um sie dieser Session zuzuordnen.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-[#7f5af0]/30 rounded-lg bg-[#1e1e2f]">
              {npcs.map((npc) => (
                <div 
                  key={npc.id}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#7f5af0]/10 transition-colors"
                >
                  <Checkbox 
                    id={`npc-${npc.id}`}
                    checked={selectedNpcs.includes(npc.id)}
                    onCheckedChange={() => toggleNpcSelection(npc.id)}
                    className="border-[#d4af37] data-[state=checked]:bg-[#d4af37] data-[state=checked]:text-[#1e1e2f]"
                  />
                  <label 
                    htmlFor={`npc-${npc.id}`}
                    className="text-sm font-medium leading-none cursor-pointer flex-1"
                  >
                    {npc.name} {npc.firstSessionId && <span className="ml-1 text-xs text-[#f5f5f5]/40">(Bereits bekannt)</span>}
                  </label>
                  <span className="text-xs text-[#f5f5f5]/40">{npc.relationship}</span>
                </div>
              ))}
            </div>
          )}
          
          {selectedNpcs.length > 0 && (
            <div className="text-xs text-[#d4af37]">
              <Users className="inline-block w-3.5 h-3.5 mr-1" />
              {selectedNpcs.length} NPC{selectedNpcs.length > 1 ? 's' : ''} ausgewählt. Diese werden als in dieser Session "erstmalig getroffen" markiert.
            </div>
          )}
          
          {/* NPC Form Dialog */}
          <Dialog open={isNpcFormOpen} onOpenChange={setIsNpcFormOpen}>
            <DialogContent className="bg-[#1e1e2f] border border-[#7f5af0]/40 text-white max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-[#d4af37]">Neuen NPC erstellen</DialogTitle>
                <p className="text-sm text-[#f5f5f5]/60 mt-1">
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
      )}
      
      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" className="bg-[#7f5af0] hover:bg-[#7f5af0]/90">
          {existingSession ? "Aktualisieren" : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
