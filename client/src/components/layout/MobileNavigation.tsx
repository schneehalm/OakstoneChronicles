import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { Home, Users, Book, Settings, LogOut, X, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function MobileNavigation() {
  const [location] = useLocation();
  const [isHeroDetailMatch, params] = useRoute("/hero/:id");
  const heroId = params?.id;
  const { user, logoutMutation } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const isHome = location === "/";
  const isNpcs = location.includes("/npcs");
  const isSessions = location.includes("/sessions");
  const isSettings = location === "/settings";
  
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
        
        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <div className={`flex flex-col items-center justify-center py-3 cursor-pointer ${isSettings ? 'text-[#d4af37]' : 'text-[#f5f5f5]/70'}`}>
              <Settings className="h-6 w-6" />
              <span className="text-xs mt-1">Einstellungen</span>
            </div>
          </SheetTrigger>
          
          <SheetContent className="bg-[#1e1e2f]/95 backdrop-blur-md border-l border-[#d4af37]/20">
            <SheetHeader className="pb-4">
              <SheetTitle className="text-[#d4af37] font-['Cinzel_Decorative']">Einstellungen</SheetTitle>
            </SheetHeader>
            
            <div className="flex flex-col gap-2 mt-4">
              <Link href="/settings" onClick={() => setIsSettingsOpen(false)}>
                <Button variant="outline" className="w-full justify-start text-[#f5f5f5]">
                  <User className="mr-2 h-4 w-4" />
                  Profil & Konto
                </Button>
              </Link>
              
              <Separator className="my-4 bg-[#d4af37]/20" />
              
              {user ? (
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {
                    logoutMutation.mutate();
                    setIsSettingsOpen(false);
                  }}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Abmelden
                </Button>
              ) : (
                <Link href="/auth" onClick={() => setIsSettingsOpen(false)}>
                  <Button className="w-full bg-[#d4af37] hover:bg-[#d4af37]/90 text-black">
                    <User className="mr-2 h-4 w-4" />
                    Anmelden
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
