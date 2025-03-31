import { Link, useLocation } from "wouter";
import { LogOut, Plus, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const [location] = useLocation();
  const isCreatingHero = location === "/hero/create";
  const { user, isLoading, logoutMutation } = useAuth();
  
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
        
        <div className="flex items-center space-x-3">
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
          
          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="rounded-full h-10 w-10 p-0 text-[#d4af37] hover:text-[#f0c040] hover:bg-[#2a2a3f]"
                >
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>{user.username}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Einstellungen</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:text-red-500"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Abmelden</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>
    </header>
  );
}
