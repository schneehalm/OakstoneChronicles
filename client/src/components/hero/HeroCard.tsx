import { useState } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Hero } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Trash2, Download, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { exportHeroData } from "@/lib/storage";
import DeleteHeroDialog from "./DeleteHeroDialog";

interface HeroCardProps {
  hero: Hero;
}

export default function HeroCard({ hero }: HeroCardProps) {
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();
  
  // Format the date using date-fns with German locale
  const formattedDate = format(new Date(hero.updatedAt), "dd.MM.yyyy", { locale: de });
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteDialog(true);
  };
  
  const handleExportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const exportData = exportHeroData(hero.id);
      if (!exportData) {
        toast({
          title: "Export fehlgeschlagen",
          description: "Der Held konnte nicht exportiert werden.",
          variant: "destructive"
        });
        return;
      }
      
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Erstelle einen temporären Download-Link
      const a = document.createElement("a");
      a.href = url;
      a.download = `oakstone-held-${hero.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export erfolgreich",
        description: `Held "${hero.name}" wurde exportiert.`,
      });
    } catch (error) {
      console.error("Fehler beim Exportieren:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren des Helden ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };
  
  const handleHeroDeleted = () => {
    // Reload dashboard data
    if (typeof window.reloadDashboard === "function") {
      window.reloadDashboard();
    }
    // Redirect to dashboard if we're not there already
    setLocation("/");
  };
  
  const handleCardClick = () => {
    setLocation(`/hero/${hero.id}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className={cn(
          "hero-card overflow-hidden transition-all cursor-pointer transform hover:scale-[1.02] bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2720%27%20height%3D%2720%27%20viewBox%3D%270%200%2020%2020%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27%237f5af0%27%20fill-opacity%3D%270.05%27%20fill-rule%3D%27evenodd%27%3E%3Ccircle%20cx%3D%273%27%20cy%3D%273%27%20r%3D%271%27%2F%3E%3Ccircle%20cx%3D%2713%27%20cy%3D%2713%27%20r%3D%271%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]",
          hero.deceased 
            ? "opacity-70 grayscale hover:opacity-90" 
            : "hover:shadow-lg"
        )}
      >
        <div className="relative h-40 overflow-hidden bg-gradient-to-br from-[hsl(var(--primary))]/30 to-[hsl(var(--background))]">
          {hero.portrait ? (
            <img 
              src={hero.portrait} 
              alt={`${hero.name} portrait`} 
              className="object-cover w-full h-full opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-2xl">Kein Portrait</span>
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[hsl(var(--background))] to-transparent p-3">
            <div className="flex items-end justify-between">
              <h3 className="content-heading flex items-center m-0">
                {hero.deceased && <span className="mr-2" title="Verstorben">⚰️</span>}
                {hero.name}
              </h3>
              <span className="text-xs bg-primary/60 rounded-full px-2 py-0.5 text-primary-foreground">Lvl {hero.level}</span>
            </div>
            <div className="flex items-center text-sm text-foreground/80 mt-1">
              {hero.deceased ? (
                <span className="text-red-400">(verstorben)</span>
              ) : (
                <>
                  <span>{hero.race}</span>
                  <span className="mx-2">•</span>
                  <span>{hero.class}</span>
                </>
              )}
            </div>
          </div>
          {/* Action Menu */}
          <div className="absolute top-2 right-2 z-50 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="h-8 w-8 rounded-full bg-[hsl(var(--content-box))]/80 flex items-center justify-center"
                  aria-label="Aktionen"
                >
                  <MoreVertical className="h-4 w-4 text-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                sideOffset={5}
                align="end" 
                className="z-[100] w-48 dropdown-content"
              >
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    handleExportClick(e as any);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-foreground hover:bg-primary/10 focus:bg-primary/10"
                >
                  <Download className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  <span>Held exportieren</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    handleDeleteClick(e as any);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Held löschen</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="highlight text-sm">{hero.system}</span>
            <span className="text-muted-foreground text-xs">Zuletzt aktiv: {formattedDate}</span>
          </div>
          <p className="text-sm line-clamp-2 text-foreground/90">
            {hero.backstory || "Keine Hintergrundgeschichte verfügbar."}
          </p>
          {hero.tags && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(typeof hero.tags === 'string' 
                ? [hero.tags] 
                : Array.isArray(hero.tags) 
                  ? hero.tags.slice(0, 3) 
                  : []
              ).map((tag, index) => (
                <span 
                  key={index}
                  className={cn(
                    "text-xs rounded-full px-2 py-0.5",
                    index % 3 === 0 ? "bg-primary/20 border border-primary/40" :
                    index % 3 === 1 ? "bg-secondary/20 border border-secondary/40" :
                    "bg-accent/20 border border-accent/40"
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <DeleteHeroDialog 
        hero={hero}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDeleted={handleHeroDeleted}
      />
    </>
  );
}