import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Diese Funktion kann markiert werden `async`, wenn Sie `await` für Operationen wie z.B. DB-Zugriff verwenden
export function middleware(request: NextRequest) {
  // Prüfe, ob der Benutzer angemeldet ist (Client-Side)
  // Da Middleware serverseitig läuft, können wir nicht auf localStorage zugreifen
  // In einer echten App würden wir hier Cookies oder JWT prüfen

  // Für diese Demo leiten wir einfach weiter und überlassen die Prüfung dem Client
  return NextResponse.next()
}

// Konfiguriere die Middleware, um nur auf bestimmten Pfaden zu laufen
export const config = {
  matcher: [
    /*
     * Match alle Pfade außer:
     * 1. /api routes
     * 2. /_next (Next.js-Internals)
     * 3. /fonts (in /app/fonts)
     * 4. /login und /register
     * 5. alle Dateien mit Erweiterungen (.svg, .jpg, etc.)
     */
    "/((?!api|_next|fonts|login|register|favicon.ico).*)",
  ],
}
