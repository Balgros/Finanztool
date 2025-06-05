"use client"

import { useEffect, useRef } from "react"
import { useFinance } from "@/context/finance-context"
import { useTheme } from "next-themes"
import Chart from "chart.js/auto"

interface PieChartProps {
  data: Record<string, number>
}

export function PieChart({ data }: PieChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const { getCategoryById, data: financeData } = useFinance()
  const { theme } = useTheme()

  useEffect(() => {
    try {
      if (!chartRef.current) return

      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }

      const ctx = chartRef.current.getContext("2d")
      if (!ctx) return

      // Überprüfe, ob data gültig ist
      if (!data || typeof data !== "object") {
        console.error("Ungültige Daten für PieChart:", data)
        return
      }

      const labels = Object.keys(data)
      const values = Object.values(data)

      // Überprüfe, ob labels und values gültig sind
      if (!labels.length || !values.length) {
        console.error("Keine Daten für PieChart vorhanden")
        return
      }

      // Get colors for each category
      const colors = labels.map((label) => {
        const category = financeData.categories.find((cat) => cat.name === label)
        return category ? category.color : "#808080"
      })

      const textColor = theme === "dark" ? "#ffffff" : "#000000"

      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors,
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
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
                  const value = context.raw as number
                  const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) as number
                  const percentage = Math.round((value / total) * 100)
                  return `${context.label}: ${financeData.formatCurrency(value)} (${percentage}%)`
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
    } catch (error) {
      console.error("Fehler beim Erstellen des PieChart:", error)
    }
  }, [data, theme])

  return (
    <div className="h-full w-full">
      <canvas ref={chartRef} />
    </div>
  )
}
