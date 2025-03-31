import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSubnavProps {
  heroId: string;
  activeTab: string;
}

export default function HeroSubnav({ heroId, activeTab }: HeroSubnavProps) {
  const [, navigate] = useLocation();
  
  return (
    <div className="mb-6">
      {/* Back button */}
      <div className="flex items-center mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="text-[#d4af37] hover:text-[#7f5af0] -ml-2 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Zurück zur Übersicht</span>
        </Button>
      </div>
      
      {/* Hero Tabs Navigation */}
      <div className="border-b border-primary/30">
        <nav className="flex overflow-x-auto hide-scrollbar space-x-6 px-2">
          <button 
            className={`py-2 px-1 font-medium subnav-item ${activeTab === 'overview' 
              ? 'text-[#7f5af0] border-b-2 border-[#7f5af0]' 
              : 'text-[#d4af37] hover:text-[#7f5af0]'}`}
            onClick={() => navigate(`/hero/${heroId}`)}
          >
            Übersicht
          </button>
          <button 
            className={`py-2 px-1 font-medium subnav-item ${activeTab === 'npcs' 
              ? 'text-[#7f5af0] border-b-2 border-[#7f5af0]' 
              : 'text-[#d4af37] hover:text-[#7f5af0]'}`}
            onClick={() => navigate(`/hero/${heroId}/npcs`)}
          >
            NPCs
          </button>
          <button 
            className={`py-2 px-1 font-medium subnav-item ${activeTab === 'sessions' 
              ? 'text-[#7f5af0] border-b-2 border-[#7f5af0]' 
              : 'text-[#d4af37] hover:text-[#7f5af0]'}`}
            onClick={() => navigate(`/hero/${heroId}/sessions`)}
          >
            Sessions
          </button>
          <button 
            className={`py-2 px-1 font-medium subnav-item ${activeTab === 'quests' 
              ? 'text-[#7f5af0] border-b-2 border-[#7f5af0]' 
              : 'text-[#d4af37] hover:text-[#7f5af0]'}`}
            onClick={() => navigate(`/hero/${heroId}/quests`)}
          >
            Aufträge
          </button>
        </nav>
      </div>
    </div>
  );
}