/**
 * Cookie Consent Provider
 * 
 * Ce composant gere le consentement des cookies pour le site.
 * 
 * COMMENT BRANCHER DE NOUVEAUX SCRIPTS:
 * 
 * 1. Pour un script Analytics:
 *    - Verifier que consent.analytics === true avant de charger
 *    - Utiliser le hook useCookieConsent() pour acceder au consentement
 *    - Exemple: if (consent.analytics) { loadGoogleAnalytics(); }
 * 
 * 2. Pour un script Marketing:
 *    - Verifier que consent.marketing === true avant de charger
 *    - Exemple: if (consent.marketing) { loadMetaPixel(); loadGoogleAds(); }
 * 
 * 3. Pour ajouter une nouvelle categorie:
 *    - Ajouter la propriete dans CookieConsent interface
 *    - Ajouter un toggle dans CookiePreferencesModal
 *    - Mettre a jour DEFAULT_CONSENT et la logique de sauvegarde
 */

"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"

// Types pour le consentement
export interface CookieConsent {
  version: number
  essential: boolean
  analytics: boolean
  marketing: boolean
  ts: string
}

interface CookieConsentContextType {
  consent: CookieConsent | null
  isLoaded: boolean
  showBanner: boolean
  showPreferences: boolean
  acceptAll: () => void
  rejectAll: () => void
  savePreferences: (preferences: Partial<CookieConsent>) => void
  openPreferences: () => void
  closePreferences: () => void
  resetConsent: () => void
}

const COOKIE_NAME = "vmr_cookie_consent"
const COOKIE_VERSION = 1
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 // 1 an en secondes

const DEFAULT_CONSENT: CookieConsent = {
  version: COOKIE_VERSION,
  essential: true,
  analytics: false,
  marketing: false,
  ts: new Date().toISOString(),
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined)

// Fonctions utilitaires pour les cookies
function setCookie(name: string, value: string, maxAge: number) {
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`
}

function getCookie(name: string): string | null {
  const matches = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return matches ? decodeURIComponent(matches[1]) : null
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;path=/;max-age=0`
}

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)

  // Charger le consentement au montage
  useEffect(() => {
    try {
      // Essayer d'abord le cookie
      let storedConsent = getCookie(COOKIE_NAME)
      
      // Fallback sur localStorage si pas de cookie
      if (!storedConsent) {
        storedConsent = localStorage.getItem(COOKIE_NAME)
      }

      if (storedConsent) {
        const parsed = JSON.parse(storedConsent) as CookieConsent
        
        // Verifier la version
        if (parsed.version === COOKIE_VERSION) {
          setConsent(parsed)
        } else {
          // Version differente, demander a nouveau
          setShowBanner(true)
        }
      } else {
        // Pas de consentement stocke
        setShowBanner(true)
      }
    } catch {
      // Erreur de parsing, afficher le bandeau
      setShowBanner(true)
    }
    
    setIsLoaded(true)
  }, [])

  // Sauvegarder le consentement
  const saveConsent = useCallback((newConsent: CookieConsent) => {
    const consentString = JSON.stringify(newConsent)
    
    // Sauvegarder dans le cookie
    setCookie(COOKIE_NAME, consentString, COOKIE_MAX_AGE)
    
    // Fallback localStorage
    try {
      localStorage.setItem(COOKIE_NAME, consentString)
    } catch {
      // localStorage non disponible
    }
    
    setConsent(newConsent)
    setShowBanner(false)
    setShowPreferences(false)
  }, [])

  const acceptAll = useCallback(() => {
    saveConsent({
      version: COOKIE_VERSION,
      essential: true,
      analytics: true,
      marketing: true,
      ts: new Date().toISOString(),
    })
  }, [saveConsent])

  const rejectAll = useCallback(() => {
    saveConsent({
      version: COOKIE_VERSION,
      essential: true,
      analytics: false,
      marketing: false,
      ts: new Date().toISOString(),
    })
  }, [saveConsent])

  const savePreferences = useCallback((preferences: Partial<CookieConsent>) => {
    saveConsent({
      version: COOKIE_VERSION,
      essential: true,
      analytics: preferences.analytics ?? false,
      marketing: preferences.marketing ?? false,
      ts: new Date().toISOString(),
    })
  }, [saveConsent])

  const openPreferences = useCallback(() => {
    setShowPreferences(true)
    setShowBanner(false)
  }, [])

  const closePreferences = useCallback(() => {
    setShowPreferences(false)
    // Reafficher le bandeau si pas de consentement
    if (!consent) {
      setShowBanner(true)
    }
  }, [consent])

  const resetConsent = useCallback(() => {
    // Supprimer le cookie et localStorage
    deleteCookie(COOKIE_NAME)
    try {
      localStorage.removeItem(COOKIE_NAME)
    } catch {
      // Ignorer
    }
    
    setConsent(null)
    setShowBanner(true)
  }, [])

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        isLoaded,
        showBanner,
        showPreferences,
        acceptAll,
        rejectAll,
        savePreferences,
        openPreferences,
        closePreferences,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider")
  }
  return context
}
