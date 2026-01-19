import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import {
  CookieConsentProvider,
  CookieBanner,
  CookiePreferencesModal,
  ConditionalScripts,
} from "@/components/cookie-consent"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Évaluation de Propriété Gratuite au Québec | ValeurMaisonRapide",
  description:
    "Obtenez une évaluation gratuite et stratégique de votre propriété. Analyse basée sur des données réelles du marché local. Sans engagement.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY

  return (
    <html lang="fr">
      <body className={`${inter.className} font-sans antialiased`}>
        <CookieConsentProvider>
          {children}
          <CookieBanner />
          <CookiePreferencesModal />
          <ConditionalScripts />
        </CookieConsentProvider>
        <Analytics />
        {googleMapsApiKey && (
          <Script
            src={`https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`}
            strategy="lazyOnload"
          />
        )}
      </body>
    </html>
  )
}
