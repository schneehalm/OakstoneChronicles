import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 bg-card/50 backdrop-blur-sm border-purple-800/20">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gold">404 - Seite nicht gefunden</h1>
          </div>

          <p className="mt-4 text-sm text-[#f5f5f5]/70 mb-4">
            Die gesuchte Seite konnte leider nicht gefunden werden.
          </p>
          
          <div className="flex flex-col gap-2 mt-6">
            <Link href="/">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Zurück zur Startseite
              </Button>
            </Link>
            
            <Link href="/auth">
              <Button variant="outline" className="w-full mt-2 border-gold/50 text-gold hover:bg-gold/10">
                Zur Anmeldeseite
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
