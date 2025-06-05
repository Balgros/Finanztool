import { MainLayout } from "@/components/main-layout"
import { FamilyManager } from "@/components/family-manager"

export const dynamic = "force-dynamic"

export default function FamilyPage() {
  return (
    <MainLayout>
      <FamilyManager />
    </MainLayout>
  )
}
