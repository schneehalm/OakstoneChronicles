import { useState, useEffect } from "react";
import { Session, Npc } from "@/lib/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { getNpcsBySessionId } from "@/lib/storage";
import { Users } from "lucide-react";

interface SessionCardProps {
  session: Session;
  onClick?: () => void;
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  const [npcs, setNpcs] = useState<Npc[]>([]);
  
  // Format the date using date-fns with German locale
  const formattedDate = format(new Date(session.date), "dd.MM.yyyy", { locale: de });
  
  // Lade NPCs, die in dieser Session zum ersten Mal getroffen wurden
  useEffect(() => {
    if (session.id) {
      const sessionNpcs = getNpcsBySessionId(session.id);
      setNpcs(sessionNpcs);
    }
  }, [session.id]);
  
  return (
    <div 
      className="bg-[#1e1e2f]/90 border border-[#d4af37]/30 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_10px_rgba(212,175,55,0.3)] cursor-pointer bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2752%27%20height%3D%2726%27%20viewBox%3D%270%200%2052%2026%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23d4af37%27%20fill-opacity%3D%270.1%27%3E%3Cpath%20d%3D%27M10%2010c0-2.21-1.79-4-4-4-3.314%200-6-2.686-6-6h2c0%202.21%201.79%204%204%204%203.314%200%206%202.686%206%206%200%202.21%201.79%204%204%204%203.314%200%206%202.686%206%206%200%202.21%201.79%204%204%204v2c-3.314%200-6-2.686-6-6%200-2.21-1.79-4-4-4-3.314%200-6-2.686-6-6zm25.464-1.95l8.486%208.486-1.414%201.414-8.486-8.486%201.414-1.414z%27%20%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-['Cinzel_Decorative'] text-xl text-[#d4af37]">{session.title}</h3>
          <span className="text-[#f5f5f5]/60 text-sm">{formattedDate}</span>
        </div>
        <p className="text-sm line-clamp-3 whitespace-pre-line">{session.content}</p>
        
        {session.tags && session.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {session.tags.slice(0, 3).map((tag, index) => (
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
            {session.tags.length > 3 && (
              <span className="text-xs text-[#f5f5f5]/60">+{session.tags.length - 3} weitere</span>
            )}
          </div>
        )}
        
        {/* NPCs getroffen in dieser Session */}
        {npcs.length > 0 && (
          <div className="mt-3 border-t border-[#d4af37]/20 pt-2">
            <div className="flex items-center text-sm text-[#d4af37]">
              <Users className="w-4 h-4 mr-1" />
              <span>NPCs in dieser Session:</span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {npcs.map((npc) => (
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
