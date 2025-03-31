import { useState, useEffect } from "react";
import { Npc, Session } from "@/lib/types";
import { getSessionById } from "@/lib/storage";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Star } from "lucide-react";

interface NpcCardProps {
  npc: Npc;
  onClick?: () => void;
}

export default function NpcCard({ npc, onClick }: NpcCardProps) {
  const [firstSession, setFirstSession] = useState<Session | null>(null);
  
  // Lade die Session-Informationen, wenn ein firstSessionId existiert
  useEffect(() => {
    if (npc.firstSessionId && npc.firstSessionId !== 'none') {
      const session = getSessionById(npc.firstSessionId);
      if (session) {
        setFirstSession(session);
      }
    }
  }, [npc.firstSessionId]);
  
  // Relationship styling based on the relationship type
  const getRelationshipClass = (relationship: string) => {
    switch (relationship) {
      case 'ally':
      case 'neutral':
      case 'family':
      case 'mentor':
      case 'student':
        return "relationship-ally";
      case 'enemy':
      case 'rival':
        return "relationship-enemy";
      default:
        return "relationship-romance";
    }
  };
  
  // Get relationship display text
  const getRelationshipDisplay = (relationship: string) => {
    switch (relationship) {
      case 'ally': return "Verbündeter";
      case 'enemy': return "Feind";
      case 'neutral': return "Neutral";
      case 'family': return "Familie";
      case 'mentor': return "Mentor";
      case 'student': return "Schüler";
      case 'rival': return "Rivale";
      case 'romance': return "Romanze";
      default: return relationship;
    }
  };
  
  return (
    <div 
      className="bg-white/90 dark:bg-[#1e1e2f]/90 border border-[#d4af37]/30 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] cursor-pointer bg-pattern-light dark:bg-pattern-dark text-[#1e1e2f] dark:text-[#f5f5f5]"
      onClick={onClick}
    >
      <div className="flex p-3">
        <div className="flex-shrink-0 mr-3">
          <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-[#d4af37]">
            {npc.image ? (
              <img 
                src={npc.image} 
                alt={npc.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-white dark:bg-[#1e1e2f] flex items-center justify-center">
                <span className="text-[#1e1e2f]/60 dark:text-[#f5f5f5]/60">{npc.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <h4 className="font-['Cinzel_Decorative'] text-[#d4af37]">{npc.name}</h4>
            {npc.favorite && (
              <Star className="ml-1 h-4 w-4 text-[var(--theme-gold)] fill-[var(--theme-gold)]" />
            )}
          </div>
          <div className={`text-sm ${getRelationshipClass(npc.relationship)} mt-0.5`}>
            {getRelationshipDisplay(npc.relationship)}
          </div>
          {npc.location && (
            <div className="mt-1 text-xs text-[#1e1e2f]/60 dark:text-[#f5f5f5]/60">
              Getroffen in: {npc.location}
            </div>
          )}
          {firstSession && (
            <div className="mt-1 text-xs text-[#7f5af0]/80 dark:text-[#7f5af0]/80">
              Erste Begegnung: {firstSession.title} ({format(new Date(firstSession.date), "dd.MM.yyyy", { locale: de })})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
