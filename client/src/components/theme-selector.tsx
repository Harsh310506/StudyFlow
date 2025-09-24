import { useState } from "react";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Palette, Check } from "lucide-react";

type Theme = "dark" | "light" | "system" | "ocean" | "forest" | "sunset" | "purple" | "rose";

export type ThemeOption = {
  name: string;
  value: string;
  colors: {
    primary: string;
    background: string;
    accent: string;
  };
  description: string;
};

export const themes: ThemeOption[] = [
  {
    name: "Light",
    value: "light",
    colors: {
      primary: "hsl(221.2 83.2% 53.3%)",
      background: "hsl(0 0% 100%)",
      accent: "hsl(210 40% 98%)",
    },
    description: "Clean and bright"
  },
  {
    name: "Dark",
    value: "dark",
    colors: {
      primary: "hsl(217.2 91.2% 59.8%)",
      background: "hsl(222.2 84% 4.9%)",
      accent: "hsl(217.2 32.6% 17.5%)",
    },
    description: "Easy on the eyes"
  },
  {
    name: "Ocean",
    value: "ocean",
    colors: {
      primary: "hsl(200 95% 45%)",
      background: "hsl(210 25% 8%)",
      accent: "hsl(200 40% 15%)",
    },
    description: "Deep blue vibes"
  },
  {
    name: "Forest",
    value: "forest",
    colors: {
      primary: "hsl(142 76% 36%)",
      background: "hsl(120 10% 5%)",
      accent: "hsl(142 30% 10%)",
    },
    description: "Natural green theme"
  },
  {
    name: "Sunset",
    value: "sunset",
    colors: {
      primary: "hsl(25 95% 53%)",
      background: "hsl(20 14% 4%)",
      accent: "hsl(25 40% 12%)",
    },
    description: "Warm orange tones"
  },
  {
    name: "Purple",
    value: "purple",
    colors: {
      primary: "hsl(263 85% 60%)",
      background: "hsl(263 15% 5%)",
      accent: "hsl(263 30% 12%)",
    },
    description: "Rich purple elegance"
  },
  {
    name: "Rose",
    value: "rose",
    colors: {
      primary: "hsl(330 81% 60%)",
      background: "hsl(330 10% 5%)",
      accent: "hsl(330 25% 12%)",
    },
    description: "Soft pink aesthetic"
  }
];

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themes.find(t => t.value === theme) || themes[0];

  const applyTheme = (themeValue: string) => {
    setTheme(themeValue as Theme);
    
    // Apply CSS custom properties for the theme
    const themeData = themes.find(t => t.value === themeValue);
    if (themeData && themeValue !== 'light' && themeValue !== 'dark') {
      const root = document.documentElement;
      root.style.setProperty('--primary', themeData.colors.primary);
      root.style.setProperty('--background', themeData.colors.background);
      root.style.setProperty('--accent', themeData.colors.accent);
      root.classList.add('dark'); // Use dark mode structure for custom themes
    } else {
      // Reset to default theme variables
      const root = document.documentElement;
      root.style.removeProperty('--primary');
      root.style.removeProperty('--background');
      root.style.removeProperty('--accent');
    }
    
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Choose theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <div className="p-2">
          <h4 className="text-sm font-medium mb-3">Choose your theme</h4>
          <div className="grid gap-1">
            {themes.map((themeOption) => (
              <DropdownMenuItem
                key={themeOption.value}
                onClick={() => applyTheme(themeOption.value)}
                className="flex items-center justify-between p-2 cursor-pointer rounded-md hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div 
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: themeOption.colors.primary }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: themeOption.colors.background }}
                    />
                    <div 
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: themeOption.colors.accent }}
                    />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{themeOption.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {themeOption.description}
                    </div>
                  </div>
                </div>
                {theme === themeOption.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}