import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import HeroDetail from "@/pages/hero-detail";
import CreateHero from "@/pages/create-hero";
import EditHero from "@/pages/edit-hero";
import Npcs from "@/pages/npcs";
import Sessions from "@/pages/sessions";
import Quests from "@/pages/quests";
import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNavigation";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/hero/create" component={CreateHero} />
      <Route path="/hero/:id/edit" component={EditHero} />
      <Route path="/hero/:id/npcs" component={Npcs} />
      <Route path="/hero/:id/sessions" component={Sessions} />
      <Route path="/hero/:id/quests" component={Quests} />
      <Route path="/hero/:id" component={HeroDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen bg-[#1e1e2f] text-[#f5f5f5] font-inter bg-[radial-gradient(circle_at_25%_25%,rgba(127,90,240,0.05)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(212,175,55,0.05)_0%,transparent_50%)]">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6">
          <Router />
        </main>
        
        {!location.includes("/hero/create") && !location.includes("/edit") && (
          <MobileNavigation />
        )}
        
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
