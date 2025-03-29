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
import { exportAllHeroes, exportHeroData, importHeroCollection, importHeroData, ExportedHeroCollection, ExportedHero } from "@/lib/storage";
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
  const handleExportAll = () => {
    if (heroes.length === 0) {
      toast({
        title: "Keine Helden vorhanden",
        description: "Es gibt keine Helden zum Exportieren.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const exportData = exportAllHeroes();
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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Versuche zuerst, die Daten als Sammlung zu verarbeiten
        if (parsedData.version && Array.isArray(parsedData.heroes)) {
          const data = parsedData as ExportedHeroCollection;
          const result = importHeroCollection(data, replaceExisting);
          
          if (result.success) {
            setImportSuccess({ imported: result.imported, total: result.total });
            onImportSuccess();
          } else {
            setImportError("Beim Importieren der Helden ist ein Fehler aufgetreten.");
          }
          return;
        }
        
        // Versuche als einzelner Held zu verarbeiten
        if (parsedData.hero && Array.isArray(parsedData.npcs) && Array.isArray(parsedData.sessions) && Array.isArray(parsedData.quests)) {
          try {
            const singleHeroData = parsedData as ExportedHero;
            const success = importHeroData(singleHeroData, replaceExisting);
            
            if (success) {
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
              className="flex items-center gap-2 border-[#d4af37]/40 bg-[#1e1e2f] hover:bg-[#1e1e2f]/80"
              onClick={handleExportAll}
            >
              <Download className="h-4 w-4 text-[#d4af37]" />
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
              className="flex items-center gap-2 border-[#7f5af0]/40 bg-[#1e1e2f] hover:bg-[#1e1e2f]/80"
              onClick={() => setIsImportOpen(true)}
            >
              <Upload className="h-4 w-4 text-[#7f5af0]" />
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
        <DialogContent className="sm:max-w-md bg-[#1e1e2f] border-2 border-[#7f5af0]/60 shadow-lg shadow-[#7f5af0]/20">
          <DialogHeader>
            <DialogTitle className="text-[#d4af37] font-['Cinzel_Decorative'] text-xl">
              Helden importieren
            </DialogTitle>
            <DialogDescription className="text-[#f5f5f5] mt-2">
              Wähle eine JSON-Datei mit Heldendaten aus, um sie zu importieren.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {importError && (
              <Alert variant="destructive" className="mb-4 border-2 border-red-700 bg-red-900/30">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-white font-semibold">Fehler</AlertTitle>
                <AlertDescription className="text-white">{importError}</AlertDescription>
              </Alert>
            )}
            
            {importSuccess && (
              <Alert className="mb-4 bg-[#43ffaf]/10 border-2 border-[#43ffaf]/50">
                <Check className="h-5 w-5 text-[#43ffaf]" />
                <AlertTitle className="text-[#43ffaf] font-semibold">Import erfolgreich</AlertTitle>
                <AlertDescription className="text-[#f5f5f5]">
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
                <div className="w-full bg-[#1e1e2f] border-2 border-[#7f5af0]/60 rounded-lg px-4 py-3 text-sm flex items-center justify-between hover:border-[#7f5af0] transition-colors">
                  <span className="text-[#f5f5f5]">
                    Datei auswählen...
                  </span>
                  <Upload className="h-5 w-5 text-[#7f5af0]" />
                </div>
              </div>
              
              <div className="w-full flex items-center space-x-3 py-2">
                <Checkbox 
                  id="replaceExisting" 
                  checked={replaceExisting}
                  onCheckedChange={(checked) => setReplaceExisting(checked === true)}
                  className="h-5 w-5 bg-[#1e1e2f] border-2 border-[#7f5af0]/60 text-[#7f5af0] data-[state=checked]:bg-[#7f5af0]"
                />
                <label
                  htmlFor="replaceExisting"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#f5f5f5]"
                >
                  Vorhandene Helden ersetzen
                </label>
              </div>
              
              <div className="w-full bg-[#1e1e2f]/90 border border-[#7f5af0]/30 p-3 rounded-md">
                <p className="text-[#f5f5f5]/90 text-xs text-center">
                  Unterstützt sowohl einzelne Helden als auch Helden-Sammlungen im JSON-Format, die mit Oakstone Chronicles exportiert wurden.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between sm:justify-between gap-3 mt-4">
            <DialogClose asChild>
              <Button 
                type="button" 
                variant="secondary"
                className="bg-[#1e1e2f] hover:bg-[#1e1e2f]/80 border-2 border-[#7f5af0]/60 text-[#f5f5f5] hover:border-[#7f5af0]"
              >
                Schließen
              </Button>
            </DialogClose>
            
            <Button
              type="button"
              variant="ghost"
              onClick={resetImportDialog}
              className="text-[#f5f5f5] hover:text-[#f5f5f5] hover:bg-[#1e1e2f]/80 border border-[#f5f5f5]/30"
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