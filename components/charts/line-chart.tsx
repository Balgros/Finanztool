"use client"

import { useEffect, useRef } from "react"
import { useFinance } from "@/context/finance-context"
import { useTheme } from "next-themes"
import Chart from "chart.js/auto"

interface DataPoint {
  label: string
  value: number
}

interface LineChartProps {
  incomeData: DataPoint[]
  expenseData: DataPoint[]
}

export function LineChart({ incomeData, expenseData }: LineChartProps) {
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
    const gridColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"

    // Berechne den maximalen Wert für die Y-Achse
    const maxIncome = Math.max(...incomeData.map((item) => item.value), 0)
    const maxExpense = Math.max(...expenseData.map((item) => item.value), 0)
    const maxValue = Math.max(maxIncome, maxExpense)

    // Prüfe, ob die Werte sehr unterschiedlich sind
    const useLogarithmicScale = false // Deaktiviere logarithmische Skala standardmäßig

    // Begrenze den maximalen Wert auf 110% des höchsten Wertes
    const suggestedMax = maxValue === 0 ? 100 : maxValue * 1.1

    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: incomeData.map((item) => item.label),
        datasets: [
          {
            label: "Einnahmen",
            data: incomeData.map((item) => item.value),
            borderColor: "hsl(var(--income))",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "hsl(var(--income))",
          },
          {
            label: "Ausgaben",
            data: expenseData.map((item) => item.value),
            borderColor: "hsl(var(--expense))",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderWidth: 2,
            tension: 0.3,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: "hsl(var(--expense))",
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
              color: gridColor,
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
              usePointStyle: true,
              pointStyle: "circle",
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
  }, [incomeData, expenseData, theme, formatCurrency])

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
