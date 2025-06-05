import { ScrollArea } from "@/components/ui/scroll-area"

interface ChangelogEntry {
  version: string
  date: string
  changes: string[]
}

const changelogData: ChangelogEntry[] = [
  {
    version: "1.0.0",
    date: "21.05.2025",
    changes: [
      "Initiale Veröffentlichung von TavaFinance",
      "Dashboard mit Finanzübersicht",
      "Einnahmen- und Ausgabenverwaltung",
      "Kategorien- und Personenverwaltung",
      "Kontoverwaltung mit Überträgen",
      "Budgetverwaltung",
      "Berichte und Analysen",
      "Dunkles und helles Design",
    ],
  },
  {
    version: "1.1.0",
    date: "21.05.2025",
    changes: [
      "Wiederkehrende Transaktionen hinzugefügt",
      "E-Mail-Benachrichtigungen für anstehende Transaktionen",
      "Verbessertes Dashboard mit mehr Visualisierungen",
      "Neues TavaFinance Branding",
      "Verbesserte Benutzeroberfläche und Benutzererfahrung",
    ],
  },
]

export function Changelog() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Changelog</h2>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-12">
          {changelogData.map((entry) => (
            <div key={entry.version} className="relative pl-8 border-l pb-2">
              <div className="absolute left-[-6px] top-1 h-3 w-3 rounded-full bg-primary shadow-md"></div>
              <div className="flex items-baseline justify-between mb-4">
                <h3 className="text-lg font-semibold">Version {entry.version}</h3>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
              <ul className="mt-4 space-y-3">
                {entry.changes.map((change, index) => (
                  <li key={index} className="text-sm pl-5 relative">
                    <span className="absolute left-0">•</span>
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
