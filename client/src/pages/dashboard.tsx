import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import HeroCard from "@/components/hero/HeroCard";
import HeroImportExport from "@/components/hero/HeroImportExport";
import DemoDataInitializer from "@/components/demo/DemoDataInitializer";
import { Hero, Activity } from "@/lib/types";
import { getHeroes, getRecentActivities, getHeroById } from "@/lib/storage";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function Dashboard() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [filteredHeroes, setFilteredHeroes] = useState<Hero[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [reloadTrigger, setReloadTrigger] = useState(0);
  
  // Attach a function to window to allow HeroCard to trigger a reload
  useEffect(() => {
    // @ts-ignore - Adding a custom method to window
    window.reloadDashboard = () => {
      setReloadTrigger(prev => prev + 1);
    };
    
    return () => {
      // @ts-ignore - Cleaning up
      delete window.reloadDashboard;
    };
  }, []);
  
  useEffect(() => {
    // Load heroes
    const loadData = () => {
      const heroData = getHeroes();
      setHeroes(heroData);
      setFilteredHeroes(heroData);
      
      // Load recent activities
      const activityData = getRecentActivities(5);
      setActivities(activityData);
    };
    
    loadData();
  }, [reloadTrigger]);
  
  useEffect(() => {
    // Filter heroes based on search term
    if (searchTerm.trim() === "") {
      setFilteredHeroes(heroes);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = heroes.filter(
        hero => 
          hero.name.toLowerCase().includes(term) || 
          hero.race.toLowerCase().includes(term) || 
          hero.class.toLowerCase().includes(term) || 
          hero.system.toLowerCase().includes(term) ||
          (hero.backstory && hero.backstory.toLowerCase().includes(term)) ||
          hero.tags.some(tag => tag.toLowerCase().includes(term))
      );
      setFilteredHeroes(filtered);
    }
  }, [searchTerm, heroes]);
  
  const getActivityIcon = (activity: Activity) => {
    if (activity.type.includes('hero')) {
      return (
        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#7f5af0]/60">
          {(() => {
            const hero = getHeroById(activity.heroId);
            return hero?.portrait ? (
              <img 
                src={hero.portrait} 
                alt={hero.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-[#7f5af0]/20 flex items-center justify-center">
                <span className="text-[#f5f5f5]/40 text-xl">?</span>
              </div>
            );
          })()}
        </div>
      );
    } else if (activity.type.includes('session')) {
      return (
        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#d4af37]/60">
          <div className="h-full w-full bg-[#d4af37]/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#d4af37]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        </div>
      );
    } else if (activity.type.includes('npc')) {
      return (
        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#43ffaf]/60">
          <div className="h-full w-full bg-[#43ffaf]/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#43ffaf]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      );
    } else {
      return (
        <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#7f5af0]/60">
          <div className="h-full w-full bg-[#7f5af0]/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#7f5af0]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37] mb-3 md:mb-0">Deine Helden</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Input 
              type="text" 
              placeholder="Suche nach Helden..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e1e2f] border border-[#7f5af0]/40 rounded-lg px-4 py-2 focus:outline-none focus:border-[#7f5af0] focus:ring-1 focus:ring-[#7f5af0]"
            />
            <Search className="absolute right-3 top-2.5 text-[#7f5af0]/60 h-5 w-5" />
          </div>
          
          {/* Import/Export Komponente */}
          <HeroImportExport
            heroes={heroes}
            onImportSuccess={() => setReloadTrigger(prev => prev + 1)}
          />
        </div>
      </div>

      {/* Hero Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHeroes.map((hero) => (
          <HeroCard key={hero.id} hero={hero} />
        ))}
        
        {/* Create New Hero Card */}
        <Link href="/hero/create">
          <div className="bg-[#1e1e2f]/50 border border-dashed border-[#7f5af0]/40 rounded-xl overflow-hidden transition-all hover:shadow-[0_0_10px_rgba(127,90,240,0.3)] cursor-pointer flex flex-col items-center justify-center p-8 group">
            <div className="h-16 w-16 rounded-full bg-[#7f5af0]/10 border border-[#7f5af0]/30 flex items-center justify-center mb-4 group-hover:bg-[#7f5af0]/20 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#7f5af0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="font-['Cinzel_Decorative'] text-[#7f5af0] text-xl text-center">Neuen Helden erstellen</h3>
            <p className="text-[#f5f5f5]/60 text-sm text-center mt-2">Beginne eine neue Heldenreise</p>
          </div>
        </Link>
      </div>
      
      {/* Recent Activity Section */}
      {activities.length > 0 && (
        <div className="mt-10">
          <h2 className="font-['Cinzel_Decorative'] text-2xl text-[#d4af37] mb-6">Letzte Aktivitäten</h2>
          
          <div className="space-y-4">
            {activities.map((activity) => {
              const hero = getHeroById(activity.heroId);
              if (!hero) return null;
              
              return (
                <div 
                  key={activity.id}
                  className="bg-[#1e1e2f]/90 border border-[#d4af37]/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2752%27%20height%3D%2726%27%20viewBox%3D%270%200%2052%2026%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27none%27%20fill-rule%3D%27evenodd%27%3E%3Cg%20fill%3D%27%23d4af37%27%20fill-opacity%3D%270.1%27%3E%3Cpath%20d%3D%27M10%2010c0-2.21-1.79-4-4-4-3.314%200-6-2.686-6-6h2c0%202.21%201.79%204%204%204%203.314%200%206%202.686%206%206%200%202.21%201.79%204%204%204%203.314%200%206%202.686%206%206%200%202.21%201.79%204%204%204v2c-3.314%200-6-2.686-6-6%200-2.21-1.79-4-4-4-3.314%200-6-2.686-6-6zm25.464-1.95l8.486%208.486-1.414%201.414-8.486-8.486%201.414-1.414z%27%20%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]"
                >
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h4 className="font-['Cinzel_Decorative'] text-[#d4af37]">{hero.name}</h4>
                      <span className="text-[#f5f5f5]/60 text-xs">
                        {format(new Date(activity.date), "dd.MM.yyyy", { locale: de })}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{activity.message}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <Link href={`/hero/${hero.id}`}>
                      <Button 
                        variant="link" 
                        className="text-[#d4af37] hover:text-[#43ffaf] transition-colors p-0"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {heroes.length === 0 && !searchTerm && (
        <>
          <div className="text-center py-16 bg-[#1e1e2f]/50 rounded-xl border border-[#7f5af0]/20">
            <h3 className="font-['Cinzel_Decorative'] text-[#d4af37] text-xl mb-3">Willkommen bei Oakstone RPG Journal</h3>
            <p className="text-[#f5f5f5]/70 mb-6">
              Erstelle deinen ersten Helden, um deine Abenteuer zu dokumentieren.
            </p>
            <Link href="/hero/create">
              <Button className="bg-[#7f5af0] hover:bg-[#7f5af0]/90">
                Neuen Helden erstellen
              </Button>
            </Link>
          </div>
          
          {/* Demo Data Initializer */}
          <DemoDataInitializer />
        </>
      )}
      
      {filteredHeroes.length === 0 && searchTerm && (
        <div className="text-center py-10 bg-[#1e1e2f]/50 rounded-xl border border-[#7f5af0]/20">
          <p className="text-[#f5f5f5]/70">Keine Helden gefunden. Versuche eine andere Suche.</p>
        </div>
      )}
    </div>
  );
}
