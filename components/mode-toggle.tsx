"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button" // Import Button

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder or null to avoid layout shift / hydration mismatch
    return (
      <Button variant="ghost" size="icon" className="w-9 h-9" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  const isDarkMode = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      aria-label={isDarkMode ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"}
      className="relative overflow-hidden"
    >
      <Sun
        className={cn(
          "h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0",
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
      />
      <Moon
        className={cn(
          "h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100",
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        )}
      />
      <span className="sr-only">Theme wechseln</span>
    </Button>
  )
}
