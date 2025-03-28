import { Link, useLocation } from "wouter";
import { Book, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [location] = useLocation();
  const isCreatingHero = location === "/hero/create";
  
  return (
    <header className="sticky top-0 z-50 bg-[#1e1e2f]/95 border-b border-[#d4af37]/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center cursor-pointer">
            <Book className="h-8 w-8 text-[#d4af37]" />
            <h1 className="ml-3 font-['Cinzel_Decorative'] text-xl md:text-2xl text-[#d4af37]">
              Oakstone RPG Journal
            </h1>
          </div>
        </Link>
        <div>
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
        </div>
      </div>
    </header>
  );
}
