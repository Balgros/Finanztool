import { ExternalLink } from "lucide-react"
import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t py-4 px-6 text-sm text-muted-foreground">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div>
          <p>© {currentYear} TavaFinance. Alle Rechte vorbehalten.</p>
        </div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <Link href="/datenschutz" className="hover:text-foreground transition-colors">
            Datenschutz
          </Link>
          <Link href="/impressum" className="hover:text-foreground transition-colors">
            Impressum
          </Link>
          <a
            href="https://github.com/tavafinance/app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-foreground transition-colors"
          >
            GitHub <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  )
}
