import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RELATIONSHIP_TYPES } from "@/lib/theme";
import { Npc, Session } from "@/lib/types";
import { saveNpc, getSessionsByHeroId } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface NpcFormProps {
  heroId: string;
  existingNpc?: Npc | null;
  onSubmit: () => void;
}

export default function NpcForm({ heroId, existingNpc, onSubmit }: NpcFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(existingNpc?.image || null);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  useEffect(() => {
    // Lade alle Sessions für diesen Helden
    const heroSessions = getSessionsByHeroId(heroId);
    // Sortiere Sessions nach Datum (neueste zuerst)
    const sortedSessions = [...heroSessions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setSessions(sortedSessions);
  }, [heroId]);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Npc>({
    defaultValues: {
      id: existingNpc?.id || '',
      heroId: heroId,
      name: existingNpc?.name || '',
      image: existingNpc?.image || '',
      relationship: existingNpc?.relationship || 'neutral',
      location: existingNpc?.location || '',
      notes: existingNpc?.notes || '',
      firstSessionId: existingNpc?.firstSessionId || 'none',
      createdAt: existingNpc?.createdAt || '',
      updatedAt: existingNpc?.updatedAt || ''
    }
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagePreview(result);
        setValue('image', result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url) {
      setImagePreview(url);
      setValue('image', url);
    } else {
      // Wenn URL leer ist, behalten wir das hochgeladene Bild bei, falls vorhanden
      if (imagePreview && imagePreview.startsWith('data:image')) {
        // Tue nichts, behalte das hochgeladene Bild bei
      } else {
        setImagePreview(null);
        setValue('image', '');
      }
    }
  };
  
  const handleFormSubmit = (data: Npc) => {
    try {
      // Save NPC
      saveNpc(data);
      
      toast({
        title: existingNpc ? "NPC aktualisiert" : "NPC erstellt",
        description: `${data.name} wurde erfolgreich ${existingNpc ? 'aktualisiert' : 'erstellt'}.`,
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
      {/* NPC Image */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-shrink-0">
          <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-[#7f5af0]/40 bg-[#7f5af0]/10 flex items-center justify-center relative group">
            {imagePreview ? (
              <img 
                src={imagePreview} 
                className="h-full w-full object-cover transition-opacity" 
                alt="NPC portrait preview"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <Upload className="h-6 w-6 text-[#7f5af0]/70 group-hover:text-[#7f5af0] transition-colors" />
              </div>
            )}
            <input 
              type="file" 
              id="npcImage" 
              className="absolute inset-0 opacity-0 cursor-pointer" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="flex-grow">
          <Label htmlFor="imageUrl">Bild-URL</Label>
          <Input
            id="imageUrl"
            placeholder="URL zum Bild (optional)"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            value={typeof imagePreview === 'string' ? imagePreview : ''}
            onChange={handleImageUrlChange}
          />
        </div>
      </div>
      
      {/* NPC Name */}
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          {...register('name', { required: true })}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">Name ist erforderlich</p>}
      </div>
      
      {/* Relationship */}
      <div>
        <Label htmlFor="relationship">Beziehung</Label>
        <Select 
          defaultValue={existingNpc?.relationship || 'neutral'} 
          onValueChange={(value) => setValue('relationship', value)}
        >
          <SelectTrigger 
            id="relationship"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          >
            <SelectValue placeholder="Beziehung wählen" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e2f] border border-[#7f5af0]/40">
            {RELATIONSHIP_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Location */}
      <div>
        <Label htmlFor="location">Ort des Treffens</Label>
        <Input
          id="location"
          placeholder="Wo habt ihr euch getroffen?"
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          {...register('location')}
        />
      </div>
      
      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notizen</Label>
        <Textarea
          id="notes"
          placeholder="Notizen über diesen NPC..."
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          rows={4}
          {...register('notes')}
        />
      </div>
      
      {/* First Session */}
      <div>
        <Label htmlFor="firstSessionId">Erste Begegnung</Label>
        <Select 
          defaultValue={existingNpc?.firstSessionId || 'none'} 
          onValueChange={(value) => setValue('firstSessionId', value)}
        >
          <SelectTrigger 
            id="firstSessionId"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          >
            <SelectValue placeholder="In welcher Session wurde dieser NPC getroffen?" />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e2f] border border-[#7f5af0]/40 max-h-[300px]">
            <SelectItem value="none">Keine Angabe</SelectItem>
            {sessions.map((session) => (
              <SelectItem key={session.id} value={session.id}>
                {session.title} ({format(new Date(session.date), "dd.MM.yyyy", { locale: de })})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" className="bg-[#7f5af0] hover:bg-[#7f5af0]/90">
          {existingNpc ? "Aktualisieren" : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
