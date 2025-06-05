const { execSync } = require("child_process")
const { networkInterfaces } = require("os")
const { spawn } = require("child_process")

// Funktion zum Ermitteln der lokalen IP-Adresse
function getLocalIpAddress() {
  const nets = networkInterfaces()
  const results = {}

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Nur IPv4 und keine internen Adressen
      if (net.family === "IPv4" && !net.internal) {
        if (!results[name]) {
          results[name] = []
        }
        results[name].push(net.address)
      }
    }
  }

  // Versuche, die Hauptnetzwerkschnittstelle zu finden
  for (const [key, addresses] of Object.entries(results)) {
    if (key.startsWith("eth") || key.startsWith("wlan") || key.startsWith("en") || key.startsWith("wi")) {
      return addresses[0]
    }
  }

  // Fallback: Nimm die erste gefundene Adresse
  for (const addresses of Object.values(results)) {
    if (addresses.length > 0) {
      return addresses[0]
    }
  }

  return "127.0.0.1" // Fallback auf localhost
}

const localIp = getLocalIpAddress()
const port = 3000

console.log("\x1b[36m%s\x1b[0m", "🚀 Starting development server...")
console.log("\x1b[32m%s\x1b[0m", `📱 Local:            http://localhost:${port}`)
console.log("\x1b[32m%s\x1b[0m", `🌐 On Your Network:  http://${localIp}:${port}`)
console.log("\x1b[33m%s\x1b[0m", "⚠️  Stellen Sie sicher, dass Ihre Firewall den Zugriff auf Port 3000 erlaubt.")

// Starte den Next.js-Entwicklungsserver
const nextDev = spawn("next", ["dev", "-H", "0.0.0.0", "-p", port.toString()], {
  stdio: "inherit",
  shell: true,
})

nextDev.on("close", (code) => {
  process.exit(code)
})
