import { Switch, Route, Redirect, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";

// Import page components
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import HeroDetail from "@/pages/hero-detail";
import CreateHero from "@/pages/create-hero";
import EditHero from "@/pages/edit-hero";
import Npcs from "@/pages/npcs";
import Sessions from "@/pages/sessions";
import Quests from "@/pages/quests";
import Stats from "@/pages/stats";
import AuthPage from "@/pages/auth-page";
import Header from "@/components/layout/Header";
import MobileNavigation from "@/components/layout/MobileNavigation";

// Simple authentication context without React context API
import { User } from "@shared/schema";

function App() {
  const [location] = useLocation();
  const isAuthPage = location === "/auth";
  
  // Basic authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Authentication check on component mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/user", {
          credentials: "include"
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  // Display loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1e1e2f]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7f5af0]" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-[#1e1e2f] text-[#f5f5f5] font-inter bg-[radial-gradient(circle_at_25%_25%,rgba(127,90,240,0.05)_0%,transparent_50%),radial-gradient(circle_at_75%_75%,rgba(212,175,55,0.05)_0%,transparent_50%)]">
      {!isAuthPage && user && <Header />}
      
      <main className={`flex-grow ${!isAuthPage ? 'container mx-auto px-4 py-6' : 'p-0'}`}>
        <Switch>
          {/* Auth page */}
          <Route path="/auth">
            {user ? <Redirect to="/" /> : <AuthPage />}
          </Route>
          
          {/* Protected routes */}
          <Route path="/">
            {user ? <Dashboard /> : <Redirect to="/auth" />}
          </Route>
          
          <Route path="/hero/create">
            {user ? <CreateHero /> : <Redirect to="/auth" />}
          </Route>
          
          <Route path="/hero/:id/edit">
            {params => user ? <EditHero /> : <Redirect to="/auth" />}
          </Route>
          
          <Route path="/hero/:id/npcs">
            {params => user ? <Npcs /> : <Redirect to="/auth" />}
          </Route>
          
          <Route path="/hero/:id/sessions">
            {params => user ? <Sessions /> : <Redirect to="/auth" />}
          </Route>
          
          <Route path="/hero/:id/quests">
            {params => user ? <Quests /> : <Redirect to="/auth" />}
          </Route>
          
          <Route path="/hero/:id/stats">
            {params => user ? <Stats /> : <Redirect to="/auth" />}
          </Route>
          
          <Route path="/hero/:id">
            {params => user ? <HeroDetail /> : <Redirect to="/auth" />}
          </Route>
          
          {/* 404 page */}
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {!isAuthPage && user && !location.includes("/hero/create") && !location.includes("/edit") && (
        <MobileNavigation />
      )}
      
      <Toaster />
    </div>
  );
}

export default App;
