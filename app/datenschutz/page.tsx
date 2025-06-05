import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function DatenschutzPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Datenschutzerklärung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">1. Datenschutz auf einen Blick</h2>
            <h3 className="text-lg font-medium mt-3">Allgemeine Hinweise</h3>
            <p className="mt-2">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie
              persönlich identifiziert werden können.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">2. Allgemeine Hinweise und Pflichtinformationen</h2>
            <h3 className="text-lg font-medium mt-3">Datenschutz</h3>
            <p className="mt-2">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre
              personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser
              Datenschutzerklärung.
            </p>

            <h3 className="text-lg font-medium mt-3">Hinweis zur verantwortlichen Stelle</h3>
            <p className="mt-2">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              <br />
              <br />
              TavaFinance GmbH
              <br />
              Musterstraße 123
              <br />
              12345 Musterstadt
              <br />
              Schweiz
              <br />
              <br />
              Telefon: +41 123 456 789
              <br />
              E-Mail: datenschutz@tavafinance.ch
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">3. Datenerfassung auf dieser Website</h2>
            <h3 className="text-lg font-medium mt-3">Cookies</h3>
            <p className="mt-2">
              Unsere Internetseiten verwenden teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen
              Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher, effektiver
              und sicherer zu machen.
            </p>

            <h3 className="text-lg font-medium mt-3">Server-Log-Dateien</h3>
            <p className="mt-2">
              Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien,
              die Ihr Browser automatisch an uns übermittelt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">4. Analyse-Tools und Werbung</h2>
            <p className="mt-2">TavaFinance verwendet keine Analyse-Tools oder Werbung von Drittanbietern.</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">5. Plugins und Tools</h2>
            <h3 className="text-lg font-medium mt-3">Web Fonts</h3>
            <p className="mt-2">
              Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Web Fonts. Die Web Fonts
              werden lokal installiert. Eine Verbindung zu Servern von Google oder anderen Anbietern erfolgt dabei
              nicht.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">6. Ihre Rechte</h2>
            <p className="mt-2">
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer
              gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder
              Löschung dieser Daten zu verlangen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
