"use client"

import { useEffect, useRef } from "react"
import { useFinance } from "@/context/finance-context"
import { useTheme } from "next-themes"
import Chart from "chart.js/auto"

interface BarChartProps {
  incomes: number
  expenses: number
}

export function BarChart({ incomes, expenses }: BarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { formatCurrency } = useFinance()
  const { theme } = useTheme()

  // Lokale Fallback-Funktion für formatCurrency, falls die Kontext-Funktion nicht verfügbar ist
  const formatCurrencyLocal = (amount: number) => {
    try {
      if (typeof formatCurrency === "function") {
        return formatCurrency(amount)
      }
      // Fallback, wenn formatCurrency nicht verfügbar ist
      return new Intl.NumberFormat("de-CH", {
        style: "currency",
        currency: "CHF",
      }).format(amount)
    } catch (error) {
      console.error("Fehler beim Formatieren des Betrags:", error)
      return `${amount.toFixed(2)} CHF`
    }
  }

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    const textColor = theme === "dark" ? "#ffffff" : "#000000"

    // Berechne den maximalen Wert für die Y-Achse
    const maxValue = Math.max(incomes, expenses)

    // Berechne einen sinnvollen Maximalwert für die Y-Achse
    // Wenn die Werte sehr unterschiedlich sind, verwenden wir eine logarithmische Skala
    const useLogarithmicScale = incomes / expenses > 10 || expenses / incomes > 10

    // Berechne einen angemessenen Puffer für die Y-Achse
    // Begrenze den maximalen Wert auf 100.000
    const suggestedMax = Math.min(maxValue * 1.1, 100000)

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Einnahmen vs. Ausgaben"],
        datasets: [
          {
            label: "Einnahmen",
            data: [incomes],
            backgroundColor: "#4ade80", // Green
            borderColor: "#22c55e",
            borderWidth: 1,
          },
          {
            label: "Ausgaben",
            data: [expenses],
            backgroundColor: "#f87171", // Red
            borderColor: "#ef4444",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            type: useLogarithmicScale ? "logarithmic" : "linear",
            beginAtZero: true,
            suggestedMax: suggestedMax,
            ticks: {
              color: textColor,
              callback: (value) => {
                try {
                  return formatCurrencyLocal(value as number)
                } catch (error) {
                  console.error("Fehler beim Formatieren des Tick-Werts:", error)
                  return `${value}`
                }
              },
            },
            grid: {
              color: theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
            },
          },
          x: {
            ticks: {
              color: textColor,
            },
            grid: {
              display: false,
            },
          },
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: textColor,
              font: {
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                try {
                  const value = context.raw as number
                  return `${context.dataset.label}: ${formatCurrencyLocal(value)}`
                } catch (error) {
                  console.error("Fehler beim Formatieren des Tooltip-Werts:", error)
                  return `${context.dataset.label}: ${context.raw}`
                }
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [incomes, expenses, theme])

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
