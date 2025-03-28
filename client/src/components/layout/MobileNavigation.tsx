import { Link, useLocation, useRoute } from "wouter";
import { Home, Users, Book, Settings } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  const [isHeroDetailMatch, params] = useRoute("/hero/:id");
  const heroId = params?.id;
  
  const isHome = location === "/";
  const isNpcs = location.includes("/npcs");
  const isSessions = location.includes("/sessions");
  
  return (
    <nav className="md:hidden bg-[#1e1e2f]/95 border-t border-[#d4af37]/20 sticky bottom-0 backdrop-blur-sm z-40">
      <div className="grid grid-cols-4 gap-1">
        <Link href="/">
          <div className={`flex flex-col items-center justify-center py-3 ${isHome ? 'text-[#d4af37]' : 'text-[#f5f5f5]/70'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Start</span>
          </div>
        </Link>
        
        {isHeroDetailMatch ? (
          <Link href={`/hero/${heroId}/npcs`}>
            <div className={`flex flex-col items-center justify-center py-3 ${isNpcs ? 'text-[#d4af37]' : 'text-[#f5f5f5]/70'}`}>
              <Users className="h-6 w-6" />
              <span className="text-xs mt-1">NPCs</span>
            </div>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center py-3 text-[#f5f5f5]/30">
            <Users className="h-6 w-6" />
            <span className="text-xs mt-1">NPCs</span>
          </div>
        )}
        
        {isHeroDetailMatch ? (
          <Link href={`/hero/${heroId}/sessions`}>
            <div className={`flex flex-col items-center justify-center py-3 ${isSessions ? 'text-[#d4af37]' : 'text-[#f5f5f5]/70'}`}>
              <Book className="h-6 w-6" />
              <span className="text-xs mt-1">Sessions</span>
            </div>
          </Link>
        ) : (
          <div className="flex flex-col items-center justify-center py-3 text-[#f5f5f5]/30">
            <Book className="h-6 w-6" />
            <span className="text-xs mt-1">Sessions</span>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center py-3 text-[#f5f5f5]/70">
          <Settings className="h-6 w-6" />
          <span className="text-xs mt-1">Einstellungen</span>
        </div>
      </div>
    </nav>
  );
}
