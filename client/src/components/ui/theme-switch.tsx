import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    // Setze den Theme und aktualisiere auch die Classes auf dem document.documentElement
    if (theme === "dark") {
      document.documentElement.classList.remove('dark');
      setTheme("light");
    } else {
      document.documentElement.classList.add('dark');
      setTheme("dark");
    }
  };
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-full border border-primary/20 hover:bg-muted/30"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-secondary" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-secondary" />
      )}
      <span className="sr-only">
        {theme === "dark" ? "Lichtmodus aktivieren" : "Dunkelmodus aktivieren"}
      </span>
    </Button>
  );
}