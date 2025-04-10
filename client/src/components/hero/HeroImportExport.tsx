import { useState, useRef } from "react";
import { Download, Upload, X, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  exportAllHeroes, 
  exportHeroData, 
  importHeroData,
  importHeroCollection,
  ExportedHeroCollection, 
  ExportedHero 
} from "@/lib/api";
import { Hero } from "@/lib/types";

interface HeroImportExportProps {
  heroes: Hero[];
  onImportSuccess: () => void;
}

export default function HeroImportExport({ heroes, onImportSuccess }: HeroImportExportProps) {
  const { toast } = useToast();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<{ imported: number; total: number } | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Exportiere alle Helden als JSON-Datei
  const handleExportAll = async () => {
    if (heroes.length === 0) {
      toast({
        title: "Keine Helden vorhanden",
        description: "Es gibt keine Helden zum Exportieren.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const exportData = await exportAllHeroes();
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      // Erstelle einen temporären Download-Link
      const a = document.createElement("a");
      a.href = url;
      a.download = `oakstone-helden-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export erfolgreich",
        description: `${exportData.heroes.length} Helden wurden exportiert.`,
      });
    } catch (error) {
      console.error("Fehler beim Exportieren:", error);
      toast({
        title: "Export fehlgeschlagen",
        description: "Beim Exportieren der Helden ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
    }
  };
  
  // Helfer-Funktion zum Auswählen und Importieren einer Datei
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Versuche zuerst, die Daten als Sammlung zu verarbeiten
        if (parsedData.version && Array.isArray(parsedData.heroes)) {
          try {
            const data = parsedData as ExportedHeroCollection;
            const result = await importHeroCollection(data, replaceExisting);
            
            if (result && result.success) {
              setImportSuccess({ imported: result.imported, total: result.total });
              onImportSuccess();
            } else {
              setImportError("Beim Importieren der Helden ist ein Fehler aufgetreten.");
            }
          } catch (error) {
            console.error("Fehler beim Importieren der Helden-Sammlung:", error);
            setImportError("Beim Importieren der Helden ist ein Fehler aufgetreten.");
          }
          return;
        }
        
        // Versuche als einzelner Held zu verarbeiten
        if (parsedData.hero && Array.isArray(parsedData.npcs) && Array.isArray(parsedData.sessions) && Array.isArray(parsedData.quests)) {
          try {
            const singleHeroData = parsedData as ExportedHero;
            const success = await importHeroData(singleHeroData, replaceExisting);
            
            if (success === true) {
              setImportSuccess({ imported: 1, total: 1 });
              onImportSuccess();
            } else {
              setImportError(
                `Der Held existiert bereits. ${!replaceExisting ? 'Aktiviere die Option "Vorhandene Helden ersetzen" und versuche es erneut.' : 'Es ist ein Fehler beim Überschreiben aufgetreten.'}`
              );
            }
          } catch (error) {
            console.error("Fehler beim Importieren eines einzelnen Helden:", error);
            setImportError("Fehler beim Import: Die Datenstruktur des Helden ist ungültig.");
          }
          return;
        }
        
        // Wenn keine der Optionen funktioniert hat
        setImportError("Die Datei enthält keine gültigen Heldendaten.");
        
      } catch (error) {
        console.error("Fehler beim Parsen der Import-Datei:", error);
        setImportError("Die Datei konnte nicht verarbeitet werden. Stellen Sie sicher, dass es sich um eine gültige JSON-Datei handelt.");
      }
    };
    
    reader.onerror = () => {
      setImportError("Die Datei konnte nicht gelesen werden.");
    };
    
    reader.readAsText(file);
  };
  
  // Zurücksetzen des Import-Dialogs
  const resetImportDialog = () => {
    setImportError(null);
    setImportSuccess(null);
    setReplaceExisting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              className="SecondaryButtonOutlined"
              onClick={handleExportAll}
            >
              <Download className="h-4 w-4 mr-2" />
              <span>Helden exportieren</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Alle Helden als JSON-Datei exportieren</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              className="SecondaryButtonOutlined"
              onClick={() => setIsImportOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Helden importieren</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Helden aus einer JSON-Datei importieren</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Import Dialog */}
      <Dialog open={isImportOpen} onOpenChange={(open) => {
        setIsImportOpen(open);
        if (!open) resetImportDialog();
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Helden importieren</DialogTitle>
            <DialogDescription>
              Wähle eine JSON-Datei mit Heldendaten aus, um sie zu importieren.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {importError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Fehler</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
            
            {importSuccess && (
              <Alert className="mb-4 success-alert">
                <Check className="h-4 w-4 text-[hsl(var(--accent))]" />
                <AlertTitle>Import erfolgreich</AlertTitle>
                <AlertDescription>
                  {importSuccess.imported} von {importSuccess.total} Helden wurden erfolgreich importiert.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="flex flex-col items-center gap-4">
              <div className="w-full relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />
                <div className="w-full bg-[hsl(var(--content-box))] border border-input rounded-lg px-4 py-3 text-sm flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Datei auswählen...
                  </span>
                  <Upload className="h-4 w-4 text-primary" />
                </div>
              </div>
              
              <div className="w-full flex items-center space-x-2 py-2">
                <Checkbox 
                  id="replaceExisting" 
                  checked={replaceExisting}
                  onCheckedChange={(checked) => setReplaceExisting(checked === true)}
                />
                <label
                  htmlFor="replaceExisting"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Vorhandene Helden ersetzen
                </label>
              </div>
              
              <p className="text-muted-foreground text-xs text-center">
                Unterstützt sowohl einzelne Helden als auch Helden-Sammlungen im JSON-Format, die mit Oakstone Chronicles exportiert wurden.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="secondary"
              >
                Schließen
              </Button>
            </DialogClose>
            
            <Button
              type="button"
              variant="ghost"
              onClick={resetImportDialog}
            >
              <X className="h-4 w-4 mr-2" />
              Zurücksetzen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}