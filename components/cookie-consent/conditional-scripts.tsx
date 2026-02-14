/**
 * Conditional Scripts Component
 * 
 * Charge les scripts de tracking uniquement si le consentement est donne.
 * 
 * COMMENT AJOUTER UN NOUVEAU SCRIPT:
 * 
 * 1. Pour un script Analytics (ex: Google Analytics):
 *    - Ajouter le script dans le bloc {consent?.analytics && (...)}
 *    - Utiliser la strategie "afterInteractive" pour les scripts non-critiques
 * 
 * 2. Pour un script Marketing (ex: Meta Pixel):
 *    - Ajouter le script dans le bloc {consent?.marketing && (...)}
 *    - Exemple:
 *      <Script id="meta-pixel" strategy="afterInteractive">
 *        {`!function(f,b,e,v,n,t,s)...`}
 *      </Script>
 */

"use client"

import { usePathname } from "next/navigation"
import Script from "next/script"
import { useCookieConsent } from "./cookie-consent-provider"

const GOOGLE_ADS_ID_DEFAULT = "AW-17852385943"
const GOOGLE_ADS_ID_QUEBEC = "AW-17944802986"

export function ConditionalScripts() {
  const pathname = usePathname()
  const { consent, isLoaded } = useCookieConsent()

  const googleAdsTrackingId = pathname?.startsWith("/quebec") ? GOOGLE_ADS_ID_QUEBEC : GOOGLE_ADS_ID_DEFAULT

  // Ne rien charger tant que le consentement n'est pas determine
  if (!isLoaded) return null

  return (
    <>
      {/* Scripts Marketing - Google Ads */}
      {consent?.marketing && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsTrackingId}`}
            strategy="afterInteractive"
          />
          <Script id="google-ads-gtag" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${googleAdsTrackingId}');
            `}
          </Script>
        </>
      )}

      {/* 
        Scripts Analytics - Ajouter ici si necessaire
        Exemple pour Google Analytics:
        
        {consent?.analytics && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-XXXXXXXXXX');
              `}
            </Script>
          </>
        )}
      */}

      {/*
        Scripts Marketing supplementaires - Ajouter ici si necessaire
        Exemple pour Meta Pixel:
        
        {consent?.marketing && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', 'YOUR_PIXEL_ID');
              fbq('track', 'PageView');
            `}
          </Script>
        )}
      */}
    </>
  )
}
