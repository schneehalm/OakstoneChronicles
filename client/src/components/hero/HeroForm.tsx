import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { X, Plus, Upload, ArrowUpCircle } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { GAME_SYSTEMS, STATS_DEFINITIONS } from "@/lib/theme";
import { Hero, HeroStats } from "@/lib/types";
import { saveHero } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";

interface HeroFormProps {
  existingHero?: Hero;
}

export default function HeroForm({ existingHero }: HeroFormProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>(existingHero?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [portraitPreview, setPortraitPreview] = useState<string | null>(existingHero?.portrait || null);
  const [selectedSystem, setSelectedSystem] = useState<string>(existingHero?.system || '');
  const [stats, setStats] = useState<HeroStats>(existingHero?.stats || {});
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Hero>({
    defaultValues: {
      id: existingHero?.id || '',
      name: existingHero?.name || '',
      system: existingHero?.system || '',
      race: existingHero?.race || '',
      class: existingHero?.class || '',
      level: existingHero?.level || 1,
      age: existingHero?.age || undefined,
      portrait: existingHero?.portrait || '',
      backstory: existingHero?.backstory || '',
      tags: existingHero?.tags || [],
      stats: existingHero?.stats || {},
      createdAt: existingHero?.createdAt || '',
      updatedAt: existingHero?.updatedAt || ''
    }
  });
  
  // Überwache Änderungen am system-Feld
  const watchSystem = watch('system');
  
  useEffect(() => {
    // Ensure the tags field is updated when tags change
    setValue('tags', tags);
  }, [tags, setValue]);
  
  // Initialisiere oder aktualisiere die Stats bei system-Änderungen
  useEffect(() => {
    if (watchSystem && watchSystem !== selectedSystem) {
      setSelectedSystem(watchSystem);
      
      // Wenn das Regelwerk gewechselt wird, initialisiere die Stats neu
      if (watchSystem in STATS_DEFINITIONS) {
        const statDefs = STATS_DEFINITIONS[watchSystem as keyof typeof STATS_DEFINITIONS];
        const newStats: HeroStats = {};
        
        statDefs.forEach(stat => {
          // Behalte existierende Werte bei, falls sie existieren
          if (existingHero?.stats && existingHero.stats[stat.id] !== undefined) {
            newStats[stat.id] = existingHero.stats[stat.id];
          } else {
            newStats[stat.id] = stat.default || 0;
          }
        });
        
        setStats(newStats);
        setValue('stats', newStats);
      }
    }
  }, [watchSystem, selectedSystem, setValue, existingHero]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPortraitPreview(result);
        setValue('portrait', result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPortraitPreview(url);
    setValue('portrait', url);
  };
  
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Stats-Werte ändern
  const handleStatChange = (statId: string, value: number | string) => {
    const updatedStats = { ...stats, [statId]: value };
    setStats(updatedStats);
    setValue('stats', updatedStats);
  };
  
  const onSubmit = (data: Hero) => {
    try {
      // Make sure tags are included
      data.tags = tags;
      
      // Make sure stats are included
      data.stats = stats;
      
      // Save hero
      const savedHero = saveHero(data);
      
      toast({
        title: existingHero ? "Held aktualisiert" : "Held erstellt",
        description: `${data.name} wurde erfolgreich ${existingHero ? 'aktualisiert' : 'erstellt'}.`,
      });
      
      // Navigate to the hero detail page
      navigate(`/hero/${savedHero.id}`);
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37]">
          {existingHero ? "Held bearbeiten" : "Neuen Helden erstellen"}
        </h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(existingHero ? `/hero/${existingHero.id}` : "/")}
          className="text-[#f5f5f5]/70 hover:text-[#f5f5f5]"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <form 
        onSubmit={handleSubmit(onSubmit)}
        className="bg-[#1e1e2f]/90 border border-[#d4af37]/30 rounded-xl p-6 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2720%27%20height%3D%2720%27%20viewBox%3D%270%200%2020%2020%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27%237f5af0%27%20fill-opacity%3D%270.05%27%20fill-rule%3D%27evenodd%27%3E%3Ccircle%20cx%3D%273%27%20cy%3D%273%27%20r%3D%271%27%2F%3E%3Ccircle%20cx%3D%2713%27%20cy%3D%2713%27%20r%3D%271%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"
      >
        {/* Portrait Upload Section */}
        <div className="mb-6 flex flex-col sm:flex-row gap-6 items-center">
          <div className="flex-shrink-0">
            <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-[#d4af37]/40 bg-[#7f5af0]/10 flex items-center justify-center relative group">
              {portraitPreview ? (
                <img 
                  src={portraitPreview} 
                  className="h-full w-full object-cover transition-opacity" 
                  alt="Hero portrait preview"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  <Upload className="h-8 w-8 text-[#d4af37]/70 mb-1 group-hover:text-[#d4af37] transition-colors" />
                  <span className="text-xs text-[#f5f5f5]/70">Portrait hochladen</span>
                </div>
              )}
              <input 
                type="file" 
                id="heroPortrait" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <div className="flex-grow space-y-1 text-center sm:text-left">
            <h3 className="font-['Cinzel_Decorative'] text-[#d4af37] text-xl">Heldenportrait</h3>
            <p className="text-sm text-[#f5f5f5]/70">Lade ein Bild hoch oder füge eine URL ein</p>
            <div className="mt-3">
              <Input
                placeholder="Bild-URL (optional)"
                className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
                value={typeof portraitPreview === 'string' ? portraitPreview : ''}
                onChange={handleImageUrlChange}
              />
            </div>
          </div>
        </div>
        
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
          <div>
            <Label htmlFor="heroName" className="block text-[#d4af37] mb-1">Name *</Label>
            <Input
              id="heroName"
              placeholder="Name deines Helden"
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
              {...register('name', { required: true })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">Name ist erforderlich</p>}
          </div>
          
          <div>
            <Label htmlFor="heroSystem" className="block text-[#d4af37] mb-1">Regelwerk *</Label>
            <Select 
              defaultValue={existingHero?.system || ''} 
              onValueChange={(value) => setValue('system', value)}
            >
              <SelectTrigger 
                id="heroSystem"
                className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
              >
                <SelectValue placeholder="Regelwerk auswählen" />
              </SelectTrigger>
              <SelectContent>
                {GAME_SYSTEMS.map((system) => (
                  <SelectItem key={system.value} value={system.value}>
                    {system.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.system && <p className="text-red-500 text-sm mt-1">Regelwerk ist erforderlich</p>}
          </div>
          
          <div>
            <Label htmlFor="heroRace" className="block text-[#d4af37] mb-1">Volk / Spezies</Label>
            <Input
              id="heroRace"
              placeholder="z.B. Mensch, Elf, Zwerg..."
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
              {...register('race')}
            />
          </div>
          
          <div>
            <Label htmlFor="heroClass" className="block text-[#d4af37] mb-1">Klasse / Beruf</Label>
            <Input
              id="heroClass"
              placeholder="z.B. Krieger, Magier, Händler..."
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
              {...register('class')}
            />
          </div>
          
          <div>
            <Label htmlFor="heroAge" className="block text-[#d4af37] mb-1">Alter</Label>
            <Input
              id="heroAge"
              type="number"
              min="0"
              placeholder="Alter des Charakters"
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
              {...register('age', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <Label htmlFor="heroLevel" className="block text-[#d4af37] mb-1">Stufe / Level</Label>
            <Input
              id="heroLevel"
              type="number"
              min="1"
              placeholder="Level"
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
              {...register('level', { required: true, valueAsNumber: true, min: 1 })}
            />
            {errors.level && <p className="text-red-500 text-sm mt-1">Level ist erforderlich</p>}
          </div>
        </div>
        
        {/* Backstory */}
        <div className="mb-6">
          <Label htmlFor="heroBackstory" className="block text-[#d4af37] mb-1">Hintergrundgeschichte</Label>
          <Textarea
            id="heroBackstory"
            rows={5}
            placeholder="Erzähle die Geschichte deines Helden..."
            className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
            {...register('backstory')}
          />
        </div>
        
        {/* Statistiken / Attribute */}
        <div className="mb-6">
          <Accordion type="single" collapsible defaultValue="stats" className="w-full">
            <AccordionItem value="stats">
              <AccordionTrigger className="text-[#d4af37] hover:text-[#d4af37] hover:no-underline">
                <span className="flex items-center gap-2">
                  <ArrowUpCircle className="h-5 w-5" />
                  Attribute & Statistiken
                </span>
              </AccordionTrigger>
              <AccordionContent>
                {watchSystem && STATS_DEFINITIONS[watchSystem as keyof typeof STATS_DEFINITIONS] ? (
                  <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {STATS_DEFINITIONS[watchSystem as keyof typeof STATS_DEFINITIONS].map((stat) => (
                      <div key={stat.id} className="relative group">
                        <Label
                          htmlFor={`stat-${stat.id}`}
                          className="block text-[#f5f5f5] text-sm mb-1"
                        >
                          {stat.label}
                        </Label>
                        <Input
                          id={`stat-${stat.id}`}
                          type={stat.type || 'number'}
                          min={'min' in stat ? stat.min : undefined}
                          max={'max' in stat ? stat.max : undefined}
                          step={'step' in stat ? stat.step : 1}
                          value={stats[stat.id] !== undefined ? stats[stat.id] : stat.default || 0}
                          onChange={(e) => {
                            const value = stat.type === 'number' ? 
                              parseInt(e.target.value, 10) : 
                              e.target.value;
                            handleStatChange(stat.id, value);
                          }}
                          className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 hover:border-[#7f5af0]/60 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4">
                    <p className="text-[#f5f5f5]/70 italic">
                      Bitte wähle zuerst ein Regelwerk, um die passenden Statistiken anzuzeigen.
                    </p>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        
        {/* Tags */}
        <div className="mb-6">
          <Label className="block text-[#d4af37] mb-1">Tags</Label>
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
              id="newTag"
              placeholder="Neuen Tag hinzufügen"
              className="flex-grow bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
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
        
        {/* Save Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button 
            type="button"
            variant="outline"
            onClick={() => navigate(existingHero ? `/hero/${existingHero.id}` : "/")}
            className="px-5 py-2 bg-[#1e1e2f] hover:bg-[#1e1e2f]/80 border border-[#d4af37]/40 rounded-lg transition-colors"
          >
            Abbrechen
          </Button>
          <Button 
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-[#d4af37] to-[#d4af37]/80 text-[#121212] font-medium rounded-lg hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] transition-all duration-300"
          >
            Held speichern
          </Button>
        </div>
      </form>
    </div>
  );
}
