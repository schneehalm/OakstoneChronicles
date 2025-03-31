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
      className="npc-card"
      onClick={onClick}
    >
      <div className="flex p-3">
        <div className="flex-shrink-0 mr-3">
          <div className="h-14 w-14 avatar-gold overflow-hidden">
            {npc.image ? (
              <img 
                src={npc.image} 
                alt={npc.name} 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                <span className="text-foreground/60">{npc.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="flex items-center">
            <h4 className="font-['Cinzel_Decorative'] highlight">{npc.name}</h4>
            {npc.favorite && (
              <Star className="ml-1 h-4 w-4 text-[var(--theme-gold)] fill-[var(--theme-gold)]" />
            )}
          </div>
          <div className={`text-sm ${getRelationshipClass(npc.relationship)} mt-0.5`}>
            {getRelationshipDisplay(npc.relationship)}
          </div>
          {npc.location && (
            <div className="mt-1 text-xs text-muted-foreground">
              Getroffen in: {npc.location}
            </div>
          )}
          {firstSession && (
            <div className="mt-1 text-xs highlight/80">
              Erste Begegnung: {firstSession.title} ({format(new Date(firstSession.date), "dd.MM.yyyy", { locale: de })})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
