"use client"

import type React from "react"
import { createContext, useState, useEffect, type ReactNode, useContext } from "react"

interface FinanceData {
  accounts: any[]
  categories: any[]
  expenses: any[]
  incomes: any[]
  people: any[]
  budgets: any[]
  transfers: any[]
  recurringTransactions: any[]
  settings: {
    currency: string
    language: string
    theme: string
  }
}

interface FinanceContextProps {
  data: FinanceData
  setData: React.Dispatch<React.SetStateAction<FinanceData>>
}

const FinanceContext = createContext<FinanceContextProps | undefined>(undefined)

interface FinanceProviderProps {
  children: ReactNode
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [data, setData] = useState<FinanceData>({
    accounts: [],
    categories: [],
    expenses: [],
    incomes: [],
    people: [],
    budgets: [],
    transfers: [],
    recurringTransactions: [],
    settings: {
      currency: "CHF",
      language: "de",
      theme: "light",
    },
  })

  useEffect(() => {
    try {
      const storedData = localStorage.getItem("financeData")
      if (storedData) {
        const parsedData = JSON.parse(storedData)
        setData(parsedData)
      }
    } catch (error) {
      console.error("Fehler beim Laden der Daten aus dem localStorage:", error)
      // Setze Standarddaten, wenn ein Fehler auftritt
      setData({
        accounts: [],
        categories: [],
        expenses: [],
        incomes: [],
        people: [],
        budgets: [],
        transfers: [],
        recurringTransactions: [],
        settings: {
          currency: "CHF",
          language: "de",
          theme: "light",
        },
      })
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem("financeData", JSON.stringify(data))
    } catch (error) {
      console.error("Fehler beim Speichern der Daten im localStorage:", error)
    }
  }, [data])

  return <FinanceContext.Provider value={{ data, setData }}>{children}</FinanceContext.Provider>
}

export const useFinance = (): FinanceContextProps => {
  const context = useContext(FinanceContext)
  if (!context) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}
