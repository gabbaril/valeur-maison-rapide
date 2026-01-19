/**
 * Cookie Preferences Modal
 * 
 * Modal permettant de personnaliser les preferences de cookies.
 * Accessible via le bouton "Personnaliser" du bandeau ou le lien footer.
 */

"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useCookieConsent } from "./cookie-consent-provider"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface CategoryToggleProps {
  id: string
  title: string
  description: string
  enabled: boolean
  disabled?: boolean
  onChange: (enabled: boolean) => void
}

function CategoryToggle({ id, title, description, enabled, disabled, onChange }: CategoryToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <label htmlFor={id} className="text-sm font-medium text-gray-900 cursor-pointer">
          {title}
        </label>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={enabled}
        disabled={disabled}
        onClick={() => !disabled && onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${enabled ? "bg-red-600" : "bg-gray-200"}
        `}
      >
        <span className="sr-only">{title}</span>
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${enabled ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  )
}

export function CookiePreferencesModal() {
  const { showPreferences, closePreferences, consent, savePreferences, acceptAll, rejectAll } = useCookieConsent()
  
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false)
  const [marketing, setMarketing] = useState(consent?.marketing ?? false)
  
  const modalRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Sync state when consent changes
  useEffect(() => {
    setAnalytics(consent?.analytics ?? false)
    setMarketing(consent?.marketing ?? false)
  }, [consent])

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!showPreferences) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePreferences()
      }
      
      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const firstElement = focusableElements[0] as HTMLElement
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    
    // Focus the close button on open
    closeButtonRef.current?.focus()
    
    // Prevent body scroll
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = ""
    }
  }, [showPreferences, closePreferences])

  const handleSave = useCallback(() => {
    savePreferences({ analytics, marketing })
  }, [savePreferences, analytics, marketing])

  const handleAcceptAll = useCallback(() => {
    setAnalytics(true)
    setMarketing(true)
    acceptAll()
  }, [acceptAll])

  const handleRejectAll = useCallback(() => {
    setAnalytics(false)
    setMarketing(false)
    rejectAll()
  }, [rejectAll])

  if (!showPreferences) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closePreferences}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="preferences-title"
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 id="preferences-title" className="text-lg font-semibold text-gray-900">
            Parametres des cookies
          </h2>
          <button
            ref={closeButtonRef}
            onClick={closePreferences}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Gerez vos preferences de cookies. Les cookies essentiels sont necessaires au fonctionnement 
            du site et ne peuvent pas etre desactives.
          </p>

          <div>
            <CategoryToggle
              id="essential-toggle"
              title="Cookies essentiels"
              description="Necessaires au fonctionnement du site. Ils permettent d'utiliser les fonctionnalites de base comme la navigation et l'acces aux zones securisees."
              enabled={true}
              disabled={true}
              onChange={() => {}}
            />

            <CategoryToggle
              id="analytics-toggle"
              title="Mesure et Analytics"
              description="Nous aident a comprendre comment les visiteurs interagissent avec le site en collectant des informations de maniere anonyme."
              enabled={analytics}
              onChange={setAnalytics}
            />

            <CategoryToggle
              id="marketing-toggle"
              title="Marketing"
              description="Utilises pour suivre les visiteurs sur les sites web afin d'afficher des publicites pertinentes (Meta, Google Ads, etc.)."
              enabled={marketing}
              onChange={setMarketing}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRejectAll}
            className="flex-1 text-gray-600 border-gray-300 hover:bg-gray-100 bg-transparent"
          >
            Tout refuser
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="flex-1 text-gray-900 border-gray-300 hover:bg-gray-100 bg-transparent"
          >
            Enregistrer
          </Button>
          <Button
            size="sm"
            onClick={handleAcceptAll}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  )
}
