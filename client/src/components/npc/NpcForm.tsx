import { useState } from "react";
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
import { Npc } from "@/lib/types";
import { saveNpc } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface NpcFormProps {
  heroId: string;
  existingNpc?: Npc | null;
  onSubmit: () => void;
}

export default function NpcForm({ heroId, existingNpc, onSubmit }: NpcFormProps) {
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState<string | null>(existingNpc?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<Npc>({
    defaultValues: {
      id: existingNpc?.id || '',
      heroId: heroId,
      name: existingNpc?.name || '',
      image: existingNpc?.image || '',
      relationship: existingNpc?.relationship || 'neutral',
      location: existingNpc?.location || '',
      notes: existingNpc?.notes || '',
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
    setImagePreview(url);
    setValue('image', url);
  };
  
  const handleFormSubmit = (data: Npc) => {
    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="mb-4">
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
        <div className="mt-4">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            {...register('name', { required: true })}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">Name ist erforderlich</p>}
        </div>
        
        {/* Relationship */}
        <div className="mt-4">
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
        <div className="mt-4">
          <Label htmlFor="location">Ort des Treffens</Label>
          <Input
            id="location"
            placeholder="Wo habt ihr euch getroffen?"
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            {...register('location')}
          />
        </div>
        
        {/* Notes */}
        <div className="mt-4">
          <Label htmlFor="notes">Notizen</Label>
          <Textarea
            id="notes"
            placeholder="Notizen über diesen NPC..."
            className="bg-[#1e1e2f] border border-[#7f5af0]/40"
            rows={4}
            {...register('notes')}
          />
        </div>
      </div>
      
      {/* Buttons - Fixed at bottom */}
      <div className="sticky bottom-0 bg-[#1e1e2f] pt-2 border-t border-[#7f5af0]/20 flex justify-end gap-2">
        <Button 
          type="submit" 
          className="bg-[#7f5af0] hover:bg-[#7f5af0]/90" 
          disabled={isSubmitting}
        >
          {isSubmitting ? "Wird gespeichert..." : existingNpc ? "Aktualisieren" : "Erstellen"}
        </Button>
      </div>
    </form>
  );
}
