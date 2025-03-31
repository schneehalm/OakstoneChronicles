import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Upload, Star, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { RELATIONSHIP_TYPES } from "@/lib/theme";
import { Npc, Session } from "@/lib/types";
import { createNpc, updateNpc, fetchSessionsByHeroId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";

interface NpcFormProps {
  heroId: string;
  existingNpc?: Npc | null;
  onSubmit: () => void;
}

export default function NpcForm({ heroId, existingNpc, onSubmit }: NpcFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(existingNpc?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Lade Sessions über die API
  const { 
    data: sessions = [], 
    isLoading: isLoadingSessions
  } = useQuery({
    queryKey: ['/api/heroes', heroId, 'sessions'],
    queryFn: () => fetchSessionsByHeroId(heroId),
    select: (data) => {
      // Sortiere Sessions nach Datum (neueste zuerst)
      return [...data].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  });
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Npc>({
    defaultValues: {
      id: existingNpc?.id || '',
      heroId: heroId, // Im Formular bleibt heroId ein String
      name: existingNpc?.name || '',
      image: existingNpc?.image || '',
      relationship: existingNpc?.relationship || 'neutral',
      location: existingNpc?.location || '',
      notes: existingNpc?.notes || '',
      favorite: existingNpc?.favorite || false,
      firstSessionId: existingNpc?.firstSessionId || 'none',
      createdAt: existingNpc?.createdAt || new Date().toISOString(), // Setze aktuelle Zeit als Default
      updatedAt: existingNpc?.updatedAt || new Date().toISOString() // Setze aktuelle Zeit als Default
    }
  });
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Zeige eine Toast-Nachricht, dass das Bild verarbeitet wird
      if (file.size > 2 * 1024 * 1024) { // Größer als 2MB
        toast({
          title: "Bild wird verarbeitet",
          description: "Große Bilder werden automatisch komprimiert. Einen Moment bitte...",
        });
      }
      
      // Lese die Datei
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const result = event.target?.result as string;
          
          // Komprimiere das Bild
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            
            // Berechne die Zielgröße basierend auf der Originalgröße
            // Bei großen Bildern stärker komprimieren
            let MAX_WIDTH = 500;
            let MAX_HEIGHT = 500;
            let compressionRate = 0.8; // Qualität für kleinere Bilder
            
            // Bei großen Bildern stärkere Kompression
            if (img.width > 1000 || img.height > 1000) {
              MAX_WIDTH = 400;
              MAX_HEIGHT = 400;
              compressionRate = 0.7;
            }
            
            // Bei sehr großen Bildern noch stärkere Kompression
            if (img.width > 2000 || img.height > 2000) {
              MAX_WIDTH = 350;
              MAX_HEIGHT = 350;
              compressionRate = 0.6;
            }
            
            // Skalierungsfaktor berechnen, um das Seitenverhältnis zu erhalten
            let width = img.width;
            let height = img.height;
            
            // Berechne den Skalierungsfaktor
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            // Setze die Canvas-Größe
            canvas.width = width;
            canvas.height = height;
            
            // Zeichne das Bild auf den Canvas
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            
            // Erzeuge das komprimierte Bild
            const compressedImage = canvas.toDataURL('image/jpeg', compressionRate);
            
            // Aktualisiere das Formular
            setImagePreview(compressedImage);
            setValue('image', compressedImage);
            
            // Leere das URL-Feld
            const urlInput = document.getElementById('imageUrl') as HTMLInputElement;
            if (urlInput) urlInput.value = '';
            
            // Bei großen Bildern eine Erfolgsmeldung anzeigen
            if (file.size > 2 * 1024 * 1024) {
              toast({
                title: "Bild komprimiert",
                description: "Das Bild wurde erfolgreich komprimiert und kann verwendet werden.",
              });
            }
          };
          
          img.src = result;
        } catch (error) {
          console.error("Fehler beim Verarbeiten des Bildes:", error);
          toast({
            title: "Fehler",
            description: "Das Bild konnte nicht verarbeitet werden. Bitte versuche ein anderes Bild.",
            variant: "destructive"
          });
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Fehler",
          description: "Das Bild konnte nicht gelesen werden. Bitte versuche es erneut.",
          variant: "destructive"
        });
      };
      
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    if (url && url.trim()) {
      // Wenn eine URL eingegeben wurde
      setImagePreview(url);
      setValue('image', url);
    } else {
      // Wenn die URL-Eingabe leer ist
      setImagePreview(null);
      setValue('image', '');
    }
  };
  
  const handleFormSubmit = async (data: Npc) => {
    try {
      setIsSubmitting(true);
      
      // Stelle sicher, dass das Bild korrekt gesetzt ist
      if (imagePreview) {
        data.image = imagePreview;
      }
      
      // Stelle sicher, dass firstSessionId korrekt gesetzt ist
      if (!data.firstSessionId) {
        data.firstSessionId = 'none';
      }
      
      // Wenn wir ein existingNpc haben, dann aktualisieren wir, sonst erstellen wir
      if (existingNpc) {
        await updateNpc(existingNpc.id, data);
      } else {
        await createNpc(heroId, data);
      }
      
      toast({
        title: existingNpc ? "NPC aktualisiert" : "NPC erstellt",
        description: `${data.name} wurde erfolgreich ${existingNpc ? 'aktualisiert' : 'erstellt'}.`,
      });
      
      // Call onSubmit callback to close the form and reload the list
      onSubmit();
    } catch (error) {
      console.error("Fehler beim Speichern des NPC:", error);
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          <Label htmlFor="imageUrl" className="form-label">Bild-URL</Label>
          <Input
            id="imageUrl"
            placeholder="URL zum Bild (optional)"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            value={imagePreview && !imagePreview.startsWith('data:') ? imagePreview : ''}
            onChange={handleImageUrlChange}
          />
        </div>
      </div>
      
      {/* NPC Name */}
      <div>
        <Label htmlFor="name" className="form-label">Name *</Label>
        <Input
          id="name"
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          {...register('name', { required: true })}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">Name ist erforderlich</p>}
      </div>
      
      {/* Relationship */}
      <div>
        <Label htmlFor="relationship" className="form-label">Beziehung</Label>
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
        <Label htmlFor="location" className="form-label">Ort des Treffens</Label>
        <Input
          id="location"
          placeholder="Wo habt ihr euch getroffen?"
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          {...register('location')}
        />
      </div>
      
      {/* Notes */}
      <div>
        <Label htmlFor="notes" className="form-label">Notizen</Label>
        <Textarea
          id="notes"
          placeholder="Notizen über diesen NPC..."
          className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          rows={4}
          {...register('notes')}
        />
      </div>
      
      {/* Favorite NPC */}
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="favorite" 
          className="border-[#7f5af0]/40 data-[state=checked]:bg-[#d4af37] data-[state=checked]:border-[#d4af37]"
          checked={watch('favorite')}
          onCheckedChange={(checked) => setValue('favorite', checked === true)}
        />
        <Label 
          htmlFor="favorite" 
          className="font-normal cursor-pointer text-sm flex items-center"
        >
          Als Favorit markieren <Star className="h-3 w-3 ml-1 text-[#d4af37] fill-[#d4af37]" />
          <span className="ml-1 text-[#f5f5f5]/60">(erscheint auf der Übersichtsseite, max. 6)</span>
        </Label>
      </div>
      
      {/* First Session */}
      <div>
        <Label htmlFor="firstSessionId" className="form-label">Erste Begegnung</Label>
        <Select 
          defaultValue={existingNpc?.firstSessionId || 'none'} 
          onValueChange={(value) => setValue('firstSessionId', value)}
          disabled={isLoadingSessions}
        >
          <SelectTrigger 
            id="firstSessionId"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
          >
            {isLoadingSessions ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-[#7f5af0]" />
                <span>Sessions werden geladen...</span>
              </div>
            ) : (
              <SelectValue placeholder="In welcher Session wurde dieser NPC getroffen?" />
            )}
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
        <Button 
          type="submit" 
          className="bg-[#7f5af0] hover:bg-[#7f5af0]/90"
          disabled={isSubmitting || isLoadingSessions}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {existingNpc ? "Wird aktualisiert..." : "Wird erstellt..."}
            </>
          ) : (
            existingNpc ? "Aktualisieren" : "Erstellen"
          )}
        </Button>
      </div>
    </form>
  );
}
