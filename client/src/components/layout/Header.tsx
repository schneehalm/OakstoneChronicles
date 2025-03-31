import { Link } from "wouter";
import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { useTheme } from "@/components/ui/theme-provider";
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
  
  // Wir verwenden window.location.href für die Umleitung
  
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
  
  const { theme } = useTheme();
  
  return (
    <header className="sticky top-0 z-50 bg-card/95 border-b border-secondary/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <img src="/OSC_Logo.png" alt="Oakstone Chronicles Logo" className="h-10 w-auto" />
            <h1 className="ml-3 font-['Cinzel_Decorative'] text-xl md:text-2xl text-secondary">
              Oakstone Chronicles
            </h1>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-primary/20 hover:bg-muted/30">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user.username.substring(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border border-secondary/20" align="end" forceMount>
                <DropdownMenuLabel className="bg-card">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">Angemeldet</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-foreground hover:bg-muted/60 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4 text-primary" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <div className="px-2 py-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Erscheinungsbild</span>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        document.documentElement.classList.remove('dark');
                        localStorage.setItem('oakstone-chronicles-theme', 'light');
                      }}
                      className={`h-7 w-7 ${theme === 'light' ? 'bg-muted' : ''} rounded-full transition-colors hover:bg-muted/60`}
                    >
                      <Sun className="h-[1rem] w-[1rem] text-secondary" />
                      <span className="sr-only">Lichtmodus</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        document.documentElement.classList.add('dark');
                        localStorage.setItem('oakstone-chronicles-theme', 'dark');
                      }}
                      className={`h-7 w-7 ${theme === 'dark' ? 'bg-muted' : ''} rounded-full transition-colors hover:bg-muted/60`}
                    >
                      <Moon className="h-[1rem] w-[1rem] text-secondary" />
                      <span className="sr-only">Dunkelmodus</span>
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
