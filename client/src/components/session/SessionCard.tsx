import { useState, useEffect } from "react";
import { Session, Npc } from "@shared/schema";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { fetchNpcsByHeroId } from "@/lib/api";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  // Format the date using date-fns with German locale
  const formattedDate = format(new Date(session.date), "dd.MM.yyyy", { locale: de });
  
  // Lade NPCs über die API
  const heroId = typeof session.heroId === 'string' ? parseInt(session.heroId) : session.heroId;
  const { data: npcs = [] } = useQuery({
    queryKey: ['/api/heroes', heroId, 'npcs'],
    queryFn: () => fetchNpcsByHeroId(heroId)
  });
  
  // Filter auf NPCs, die in dieser Session zum ersten Mal getroffen wurden
  const sessionNpcs = npcs.filter(npc => 
    npc.firstSessionId !== undefined && 
    npc.firstSessionId !== null && 
    npc.firstSessionId.toString() === session.id.toString()
  );
  
  // Tags richtig behandeln, je nachdem ob es ein Array oder String ist
  const tagsArray = Array.isArray(session.tags) 
    ? session.tags 
    : typeof session.tags === 'string' && session.tags 
      ? session.tags.split(',') 
      : [];
  
  return (
    <div 
      className="bg-[#1e1e2f]/90 dark:bg-[#1e1e2f]/90 bg-white/90 border border-[#d4af37]/30 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] cursor-pointer bg-pattern-light dark:bg-pattern-dark"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37]">{session.title}</h3>
          <span className="text-[#1e1e2f]/60 dark:text-[#f5f5f5]/60 text-sm">{formattedDate}</span>
        </div>
        <p className="text-sm line-clamp-3 whitespace-pre-line text-[#1e1e2f] dark:text-[#f5f5f5]">{session.content}</p>
        
        {tagsArray.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tagsArray.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className={`text-xs rounded-full px-2 py-0.5 ${
                  index % 3 === 0 ? "bg-[#7f5af0]/20 border border-[#7f5af0]/40" :
                  index % 3 === 1 ? "bg-[#d4af37]/20 border border-[#d4af37]/40" :
                  "bg-[#43ffaf]/20 border border-[#43ffaf]/40"
                }`}
              >
                {tag}
              </span>
            ))}
            {tagsArray.length > 3 && (
              <span className="text-xs text-[#1e1e2f]/60 dark:text-[#f5f5f5]/60">+{tagsArray.length - 3} weitere</span>
            )}
          </div>
        )}
        
        {/* NPCs getroffen in dieser Session */}
        {sessionNpcs.length > 0 && (
          <div className="mt-3 border-t border-[#d4af37]/20 pt-2">
            <div className="flex items-center text-sm text-[#d4af37]">
              <Users className="w-4 h-4 mr-1" />
              <span>NPCs in dieser Session:</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {sessionNpcs.map((npc) => (
                <span key={npc.id} className="text-xs bg-[#7f5af0]/20 border border-[#7f5af0]/40 rounded-full px-2 py-0.5">
                  {npc.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}