import { useState, useEffect } from "react";
import { Npc } from "@/lib/types";

interface NpcCardProps {
  npc: Npc;
  onClick?: () => void;
}

export default function NpcCard({ npc, onClick }: NpcCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Zurücksetzen des Bildfehlerstatus, wenn sich der NPC ändert
  useEffect(() => {
    setImageError(false);
  }, [npc.id]);
  // Relationship styling based on the relationship type
  const getRelationshipStyle = (relationship: string) => {
    switch (relationship) {
      case 'ally':
      case 'neutral':
      case 'family':
      case 'mentor':
      case 'student':
        return "text-[#7f5af0]";
      case 'enemy':
      case 'rival':
        return "text-[#d4af37]";
      default:
        return "text-[#43ffaf]";
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
      className="bg-[#1e1e2f]/90 rounded-xl border border-[#7f5af0]/30 overflow-hidden hover:shadow-[0_0_10px_rgba(127,90,240,0.3)] transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex p-3">
        <div className="flex-shrink-0 mr-3">
          <div className="h-14 w-14 rounded-full overflow-hidden border border-[#7f5af0]/40">
            {npc.image && !imageError ? (
              <img 
                src={npc.image} 
                alt={npc.name} 
                className="h-full w-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="h-full w-full bg-[#7f5af0]/20 flex items-center justify-center">
                <span className="text-[#f5f5f5]/60 text-lg font-semibold">{npc.name.charAt(0)}</span>
              </div>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-['Cinzel_Decorative'] text-[#d4af37]">{npc.name}</h4>
          <div className={`text-sm ${getRelationshipStyle(npc.relationship)} mt-0.5`}>
            {getRelationshipDisplay(npc.relationship)}
          </div>
          {npc.location && (
            <div className="mt-1 text-xs text-[#f5f5f5]/70">
              Getroffen in: {npc.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
