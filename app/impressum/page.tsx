import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ImpressumPage() {
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
          <CardTitle className="text-3xl">Impressum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Angaben gemäß § 5 TMG</h2>
            <p className="mt-2">
              TavaFinance GmbH
              <br />
              Musterstraße 123
              <br />
              12345 Musterstadt
              <br />
              Schweiz
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Kontakt</h2>
            <p className="mt-2">
              Telefon: +41 123 456 789
              <br />
              E-Mail: info@tavafinance.ch
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Handelsregister</h2>
            <p className="mt-2">
              Handelsregisternummer: HRB 123456
              <br />
              Registergericht: Amtsgericht Musterstadt
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Umsatzsteuer-ID</h2>
            <p className="mt-2">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
              <br />
              CH123456789
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
            <p className="mt-2">
              Max Mustermann
              <br />
              Musterstraße 123
              <br />
              12345 Musterstadt
              <br />
              Schweiz
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold">Haftungsausschluss</h2>
            <h3 className="text-lg font-medium mt-3">Haftung für Inhalte</h3>
            <p className="mt-2">
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
              Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            </p>

            <h3 className="text-lg font-medium mt-3">Haftung für Links</h3>
            <p className="mt-2">
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.
              Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
            </p>

            <h3 className="text-lg font-medium mt-3">Urheberrecht</h3>
            <p className="mt-2">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
              schweizerischen Urheberrecht.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
