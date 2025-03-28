import { useState } from "react";
import { Button } from "@/components/ui/button";
import { populateDemoData } from "@/lib/demoData";
import { useToast } from "@/hooks/use-toast";

export default function DemoDataInitializer() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleInitDemoData = () => {
    setIsLoading(true);
    try {
      const result = populateDemoData();
      
      toast({
        title: "Demo-Daten geladen",
        description: `Erfolgreich einen Demo-Helden mit ${result.npcsCount} NPCs, ${result.sessionsCount} Sessions und ${result.questsCount} Aufträgen erstellt.`,
      });
      
      // Reload the page to see changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast({
        title: "Fehler beim Laden der Demo-Daten",
        description: "Ein Fehler ist aufgetreten. Bitte versuche es erneut.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="text-center py-6 bg-[#1e1e2f]/50 rounded-xl border border-[#7f5af0]/20 mt-6">
      <h3 className="font-['Cinzel_Decorative'] text-[#d4af37] text-xl mb-3">Demo-Modus</h3>
      <p className="text-[#f5f5f5]/70 mb-6 px-4">
        Erstelle schnell einen Demo-Helden mit NPCs, Sessions und Aufträgen, um die App zu testen.
      </p>
      <Button 
        onClick={handleInitDemoData} 
        disabled={isLoading}
        className="bg-[#7f5af0] hover:bg-[#7f5af0]/90"
      >
        {isLoading ? "Lade Daten..." : "Demo-Daten laden"}
      </Button>
    </div>
  );
}