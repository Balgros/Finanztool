import { MainLayout } from "@/components/main-layout"
import { ExpenseManager } from "@/components/expense-manager"

export default function ExpensesPage() {
  return (
    <MainLayout>
      <ExpenseManager />
    </MainLayout>
  )
}
