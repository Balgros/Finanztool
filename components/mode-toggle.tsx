"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Verhindert Hydration-Fehler
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDarkMode = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      className={cn(
        "relative flex h-10 w-20 items-center rounded-full p-1 transition-colors duration-300",
        isDarkMode ? "bg-gradient-to-r from-blue-900 to-indigo-800" : "bg-gradient-to-r from-amber-400 to-yellow-300",
      )}
      aria-label={isDarkMode ? "Zum hellen Modus wechseln" : "Zum dunklen Modus wechseln"}
    >
      <span
        className={cn(
          "absolute flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-spring",
          isDarkMode ? "translate-x-10" : "translate-x-0",
        )}
      >
        {isDarkMode ? <Moon className="h-5 w-5 text-blue-700" /> : <Sun className="h-5 w-5 text-amber-500" />}
      </span>
      <span
        className={cn(
          "ml-2 text-xs font-medium text-white transition-opacity",
          isDarkMode ? "opacity-0" : "opacity-100",
        )}
      >
        Hell
      </span>
      <span
        className={cn(
          "ml-auto mr-2 text-xs font-medium text-white transition-opacity",
          isDarkMode ? "opacity-100" : "opacity-0",
        )}
      >
        Dunkel
      </span>
    </button>
  )
}
