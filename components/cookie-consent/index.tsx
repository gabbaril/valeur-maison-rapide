/**
 * Cookie Consent Module - Index
 * 
 * Exporte tous les composants du systeme de consentement cookies.
 * 
 * UTILISATION:
 * 
 * 1. Dans app/layout.tsx, envelopper le contenu avec <CookieConsentProvider>
 * 2. Ajouter <CookieBanner /> et <CookiePreferencesModal /> dans le body
 * 3. Ajouter <ConditionalScripts /> pour les scripts de tracking
 * 4. Utiliser useCookieConsent() pour acceder au consentement dans les composants
 */

export { CookieConsentProvider, useCookieConsent, type CookieConsent } from "./cookie-consent-provider"
export { CookieBanner } from "./cookie-banner"
export { CookiePreferencesModal } from "./cookie-preferences-modal"
export { ConditionalScripts } from "./conditional-scripts"
