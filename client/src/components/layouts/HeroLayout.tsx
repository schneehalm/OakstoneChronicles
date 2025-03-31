import { ReactNode } from "react";
import HeroSubnav from "@/components/hero/HeroSubnav";

interface HeroLayoutProps {
  heroId: string;
  activeTab: string;
  children: ReactNode;
}

export default function HeroLayout({ heroId, activeTab, children }: HeroLayoutProps) {
  return (
    <div>
      {/* Hero Subnav - immer oben und einheitliches Styling */}
      <div className="mb-6 sticky top-0 z-10 bg-background/95 dark:bg-[#1e1e2f]/95 backdrop-blur-sm pt-4 pb-1 border-b border-primary/20">
        <HeroSubnav heroId={heroId} activeTab={activeTab} />
      </div>
      
      {/* Content der jeweiligen Seite */}
      <div>{children}</div>
    </div>
  );
}