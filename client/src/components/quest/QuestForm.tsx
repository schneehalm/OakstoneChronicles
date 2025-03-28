import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { QUEST_TYPES } from "@/lib/theme";
import { Quest } from "@/lib/types";
import { saveQuest } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface QuestFormProps {
  heroId: string;
  existingQuest?: Quest | null;
  onSubmit: () => void;
}

export default function QuestForm({ heroId, existingQuest, onSubmit }: QuestFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Quest>({
    defaultValues: {
      id: existingQuest?.id || '',
      heroId: heroId,
      title: existingQuest?.title || '',
      description: existingQuest?.description || '',
      type: existingQuest?.type || 'side',
      completed: existingQuest?.completed || false,
      createdAt: existingQuest?.createdAt || '',
      updatedAt: existingQuest?.updatedAt || ''
    }
  });
  
  const completed = watch('completed');
  
  const handleFormSubmit = (data: Quest) => {
    setIsSubmitting(true);
    try {
      // Save quest
      saveQuest(data);
      
      toast({
        title: existingQuest ? "Auftrag aktualisiert" : "Auftrag erstellt",
        description: `"${data.title}" wurde erfolgreich ${existingQuest ? 'aktualisiert' : 'erstellt'}.`,
      });
      
      // Call onSubmit callback
      onSubmit();
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="mb-4">
        {/* Quest Title */}
        <div>
          <Label htmlFor="title">Titel *</Label>
          <Input
            id="title"
            placeholder="Titel des Auftrags"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            {...register('title', { required: true })}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">Titel ist erforderlich</p>}
        </div>
        
        {/* Quest Type */}
        <div className="mt-4">
          <Label htmlFor="type">Typ</Label>
          <Select 
            defaultValue={existingQuest?.type || 'side'} 
            onValueChange={(value) => setValue('type', value)}
          >
            <SelectTrigger 
              id="type"
              className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            >
              <SelectValue placeholder="Auftragstyp wählen" />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e2f] border border-[#7f5af0]/40">
              {QUEST_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Quest Description */}
        <div className="mt-4">
          <Label htmlFor="description">Beschreibung *</Label>
          <Textarea
            id="description"
            placeholder="Beschreibung des Auftrags"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            rows={5}
            {...register('description', { required: true })}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">Beschreibung ist erforderlich</p>}
        </div>
        
        {/* Completed Status */}
        <div className="flex items-center space-x-2 mt-4">
          <Switch 
            id="completed" 
            checked={completed}
            onCheckedChange={(checked) => setValue('completed', checked)}
          />
          <Label htmlFor="completed">Auftrag abgeschlossen</Label>
        </div>
      </div>
      
      {/* Buttons - Fixed at bottom */}
      <div className="sticky bottom-0 bg-[#1e1e2f] pt-2 border-t border-[#7f5af0]/20 flex justify-end gap-2">
        <Button 
          type="submit" 
          className="bg-[#7f5af0] hover:bg-[#7f5af0]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gespeichert..." : existingQuest ? "Aktualisieren" : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
