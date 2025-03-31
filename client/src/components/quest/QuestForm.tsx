import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Quest } from "@shared/schema";
import { createQuest, updateQuest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Quest-Typen
const QUEST_TYPES = [
  { value: 'main', label: 'Hauptquest' },
  { value: 'side', label: 'Nebenquest' },
  { value: 'personal', label: 'Persönlich' },
  { value: 'guild', label: 'Gilde' }
];

interface QuestFormProps {
  heroId: string;
  existingQuest?: Quest | null;
  onSubmit: () => void;
}

export default function QuestForm({ heroId, existingQuest, onSubmit }: QuestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Konvertiere heroId zu number
  const heroIdAsNumber = typeof heroId === 'string' ? parseInt(heroId) : heroId;
  
  // Mutation für Quest-Erstellung/Aktualisierung
  const questMutation = useMutation({
    mutationFn: async (data: Partial<Quest>) => {
      if (existingQuest) {
        // Stelle sicher, dass existingQuest.id als Zahl übergeben wird
        const questId = typeof existingQuest.id === 'string' ? 
          parseInt(existingQuest.id) : existingQuest.id;
        return updateQuest(questId, data);
      } else {
        return createQuest(heroIdAsNumber, data as Omit<Quest, 'id' | 'heroId' | 'createdAt' | 'updatedAt'>);
      }
    },
    onSuccess: (savedQuest) => {
      // Invalidiere Caches
      queryClient.invalidateQueries({ queryKey: ['/api/heroes', heroIdAsNumber, 'quests'] });
      
      toast({
        title: existingQuest ? "Auftrag aktualisiert" : "Auftrag erstellt",
        description: `"${savedQuest.title}" wurde erfolgreich ${existingQuest ? 'aktualisiert' : 'erstellt'}.`,
      });
      
      // Callback aufrufen
      onSubmit();
    },
    onError: (error) => {
      console.error("Fehler beim Speichern des Auftrags:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  });
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Quest>({
    defaultValues: {
      // Wir konvertieren heroId zu number, da das Backend eine Zahl erwartet
      id: existingQuest?.id || undefined,
      heroId: existingQuest?.heroId || heroIdAsNumber,
      title: existingQuest?.title || '',
      description: existingQuest?.description || '',
      type: existingQuest?.type || 'side',
      completed: existingQuest?.completed || false,
      createdAt: existingQuest?.createdAt || new Date().toISOString(),
      updatedAt: existingQuest?.updatedAt || new Date().toISOString()
    }
  });
  
  const completed = watch('completed');
  
  const handleFormSubmit = (data: Quest) => {
    try {
      // Quest speichern über Mutation
      questMutation.mutate(data);
    } catch (error) {
      console.error("Fehler beim Speichern des Auftrags:", error);
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Formularfelder */}
      <div className="space-y-4">
        {/* Quest Title */}
        <div>
          <Label htmlFor="title" className="form-label">Titel *</Label>
          <Input
            id="title"
            placeholder="Titel des Auftrags"
            className="form-input"
            {...register('title', { required: true })}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">Titel ist erforderlich</p>}
        </div>
        
        {/* Quest Type */}
        <div>
          <Label htmlFor="type" className="form-label">Typ</Label>
          <Select 
            defaultValue={existingQuest?.type || 'side'} 
            onValueChange={(value) => setValue('type', value)}
          >
            <SelectTrigger 
              id="type"
              className="form-input"
            >
              <SelectValue placeholder="Auftragstyp wählen" />
            </SelectTrigger>
            <SelectContent className="dropdown-content">
              {QUEST_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Quest Description */}
        <div>
          <Label htmlFor="description" className="form-label">Beschreibung *</Label>
          <Textarea
            id="description"
            placeholder="Beschreibung des Auftrags"
            className="form-textarea"
            rows={5}
            {...register('description', { required: true })}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">Beschreibung ist erforderlich</p>}
        </div>
        
        {/* Completed Status */}
        <div className="flex items-center space-x-2">
          <Switch 
            id="completed" 
            checked={completed}
            onCheckedChange={(checked) => setValue('completed', checked)}
          />
          <Label htmlFor="completed" className="form-label">Auftrag abgeschlossen</Label>
        </div>
      </div>
      
      {/* Buttons - fest am unteren Rand */}
      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-[#1e1e2f] border-t border-[#7f5af0]/20 mt-6 -mx-6 px-6 py-4">
        <Button 
          type="submit" 
          className="PrimaryButton"
          disabled={questMutation.isPending}
        >
          {questMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {existingQuest ? "Wird aktualisiert..." : "Wird erstellt..."}
            </>
          ) : (
            existingQuest ? "Aktualisieren" : "Erstellen"
          )}
        </Button>
      </div>
    </form>
  );
}