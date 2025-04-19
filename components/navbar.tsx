"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

interface NavbarProps {
  currentTitle: string; // Accept the title as a prop
}

export function Navbar({ currentTitle }: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const { theme: resolvedTheme, setTheme } = useTheme();
  const theme = resolvedTheme || 'system';

  useEffect(() => {
    setMounted(true)
  }, []);

  // Add a small delay to prevent hydration mismatch warning for the title
  const [displayTitle, setDisplayTitle] = useState("Loading...");
  useEffect(() => {
     if (mounted) {
       setDisplayTitle(currentTitle);
     }
  }, [mounted, currentTitle]);


  if (!mounted) {
    // Render a basic structure during mount to avoid layout shifts
    return (
      <nav className="bg-background border-b border-border h-16 flex items-center justify-between px-4">
        <div className="text-lg font-semibold">Loading...</div>
        <div className="h-10 w-10"></div> {/* Placeholder for button */}
      </nav>
    );
  }

  return (
    <nav className="bg-background border-b border-border h-16 flex items-center justify-between px-4">
      {/* Display the title */}
      <div className="text-lg font-semibold truncate pr-4">
        {displayTitle}
      </div>
      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />} 
      </Button>
    </nav>
  );
}