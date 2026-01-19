/**
 * Cookie Banner Component
 * 
 * Bandeau de consentement affiche en bas de l'ecran.
 * Apparait uniquement si l'utilisateur n'a pas encore fait de choix.
 */

"use client"

import { useCookieConsent } from "./cookie-consent-provider"
import { Button } from "@/components/ui/button"

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openPreferences } = useCookieConsent()

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-white border-t border-gray-200 shadow-lg"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <h2 id="cookie-banner-title" className="sr-only">
              Gestion des cookies
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Nous utilisons des cookies pour ameliorer votre experience et mesurer la performance.
              Vous pouvez accepter, refuser, ou personnaliser vos preferences.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={openPreferences}
              className="order-3 sm:order-1 text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-800 bg-transparent"
            >
              Personnaliser
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={rejectAll}
              className="order-2 text-gray-600 border-gray-300 hover:bg-gray-50 hover:text-gray-800 bg-transparent"
            >
              Refuser
            </Button>
            <Button
              size="sm"
              onClick={acceptAll}
              className="order-1 sm:order-3 bg-red-600 hover:bg-red-700 text-white"
            >
              Accepter
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
