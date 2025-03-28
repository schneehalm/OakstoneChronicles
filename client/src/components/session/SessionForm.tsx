import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Session } from "@/lib/types";
import { saveSession } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SessionFormProps {
  heroId: string;
  existingSession?: Session | null;
  onSubmit: () => void;
}

export default function SessionForm({ heroId, existingSession, onSubmit }: SessionFormProps) {
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>(existingSession?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>(
    existingSession ? new Date(existingSession.date) : new Date()
  );
  
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
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  const handleFormSubmit = (data: Session) => {
    setIsSubmitting(true);
    try {
      // Make sure tags and date are included
      data.tags = tags;
      data.date = date.toISOString();
      
      // Save session
      saveSession(data);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="mb-4">
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
        <div className="mt-4">
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
        <div className="mt-4">
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
        <div className="mt-4">
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
      </div>
      
      {/* Buttons - Fixed at bottom */}
      <div className="sticky bottom-0 bg-[#1e1e2f] pt-2 border-t border-[#7f5af0]/20 flex justify-end gap-2">
        <Button 
          type="submit" 
          className="bg-[#7f5af0] hover:bg-[#7f5af0]/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gespeichert..." : existingSession ? "Aktualisieren" : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
