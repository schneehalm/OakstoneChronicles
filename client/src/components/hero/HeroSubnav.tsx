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
          className="text-[#f5f5f5]/70 hover:text-[#f5f5f5] -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Zurück zur Übersicht</span>
        </Button>
      </div>
      
      {/* Hero Tabs Navigation */}
      <div className="border-b border-[#d4af37]/20">
        <nav className="flex overflow-x-auto hide-scrollbar space-x-6 px-2">
          <button 
            className={`py-2 px-1 font-medium ${activeTab === 'overview' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-[#f5f5f5]/70 hover:text-[#d4af37]'}`}
            onClick={() => navigate(`/hero/${heroId}`)}
          >
            Übersicht
          </button>
          <button 
            className={`py-2 px-1 font-medium ${activeTab === 'npcs' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-[#f5f5f5]/70 hover:text-[#d4af37]'}`}
            onClick={() => navigate(`/hero/${heroId}/npcs`)}
          >
            NPCs
          </button>
          <button 
            className={`py-2 px-1 font-medium ${activeTab === 'sessions' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-[#f5f5f5]/70 hover:text-[#d4af37]'}`}
            onClick={() => navigate(`/hero/${heroId}/sessions`)}
          >
            Sessions
          </button>
          <button 
            className={`py-2 px-1 font-medium ${activeTab === 'quests' 
              ? 'text-[#d4af37] border-b-2 border-[#d4af37]' 
              : 'text-[#f5f5f5]/70 hover:text-[#d4af37]'}`}
            onClick={() => navigate(`/hero/${heroId}/quests`)}
          >
            Aufträge
          </button>
        </nav>
      </div>
    </div>
  );
}