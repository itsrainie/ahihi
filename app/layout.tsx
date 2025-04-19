"use client";
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Navbar } from "@/components/navbar"
import { Inter } from "next/font/google"
import { ThemeProvider } from 'next-themes'
import type { ReactNode } from "react"
import { useEffect, useState, createContext, useContext, useCallback } from "react"; // Added createContext, useContext, useCallback

const inter = Inter({ subsets: ["latin"] })

// 1. Create Context
interface ChatTitleContextType {
  chatTitle: string;
  updateChatTitle: (newTitle: string) => void;
}

const ChatTitleContext = createContext<ChatTitleContextType | undefined>(undefined);

// Custom hook to use the context
export function useChatTitle() {
  const context = useContext(ChatTitleContext);
  if (context === undefined) {
    throw new Error('useChatTitle must be used within a ChatTitleProvider');
  }
  return context;
}

// ClientOnly component remains the same
function ClientOnly({ children }: { children: ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <>{children}</>;
}

export default function Layout({ children }: { children: ReactNode }) {
  // 2. Add state and update function
  const [chatTitle, setChatTitle] = useState<string>("Yukie's Safe Little Corner"); // Default title

  const updateChatTitle = useCallback((newTitle: string) => {
    console.log("Updating title in Layout:", newTitle);
    if (newTitle && newTitle.trim()) { // Basic validation
        setChatTitle(newTitle.trim());
    }
  }, []);

  return (
    <html lang="en" data-render-id="initial">
      <body className={cn("flex min-h-svh flex-col antialiased", inter.className)}>
        {/* 3. Provide the context */}
        <ChatTitleContext.Provider value={{ chatTitle, updateChatTitle }}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ClientOnly>
              {/* Pass title to Navbar */}
              <Navbar currentTitle={chatTitle} />
            </ClientOnly>
            <TooltipProvider delayDuration={0}>
              <ClientOnly>{children}</ClientOnly>
            </TooltipProvider>
          </ThemeProvider>
        </ChatTitleContext.Provider>
      </body>
    </html>
  );
}

import './globals.css'
