import { Link, useLocation } from "wouter";
import { LogOut, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const isCreatingHero = location === "/hero/create";
  
  // Mock-Auth-State für Entwicklung
  const [user, setUser] = useState<{ username: string } | null>(null);
  
  // API-Anfrage für Benutzerauthentifizierung
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user', { credentials: 'include' });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Fehler beim Abrufen der Benutzerdaten:', error);
      }
    };
    
    checkAuth();
  }, []);
  
  const [, navigate] = useLocation();
  
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      // Nach dem Abmelden zur Login-Seite umleiten
      // Verwende window.location.href für eine vollständige Neuladung der Seite
      window.location.href = '/auth';
    } catch (error) {
      console.error('Fehler beim Abmelden:', error);
    }
  };
  
  return (
    <header className="sticky top-0 z-50 bg-[#1e1e2f]/95 border-b border-[#d4af37]/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <img src="/OSC_Logo.png" alt="Oakstone Chronicles Logo" className="h-10 w-auto" />
            <h1 className="ml-3 font-['Cinzel_Decorative'] text-xl md:text-2xl text-[#d4af37]">
              Oakstone Chronicles
            </h1>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {!isCreatingHero && (
            <Link href="/hero/create">
              <Button
                variant="outline" 
                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#7f5af0] to-[#7f5af0]/80 text-[#f5f5f5] hover:shadow-[0_0_10px_rgba(127,90,240,0.3)] border-[#7f5af0]/40 transition-all duration-300 flex items-center"
              >
                <Plus className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Neuer Held</span>
              </Button>
            </Link>
          )}
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-primary/20">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.username.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">Angemeldet</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
