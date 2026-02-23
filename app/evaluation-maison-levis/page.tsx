import { LandingPageTemplate } from "@/components/landing-page-template"

export default function QuebecPage() {
  return (
    <LandingPageTemplate
      heroTitle="Vous pensez vendre à Lévis en 2026 ou dans les prochains mois ?"
      addressPlaceholder="123 Rue Exemple, Lévis"
      mapVariant="levis"
      mapText="tous les arrondissements de Lévis"
      imageVariant="levis"
    />
  )
}
