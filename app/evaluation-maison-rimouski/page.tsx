import { LandingPageTemplate } from "@/components/landing-page-template"

export default function RimouskiPage() {
  return (
    <LandingPageTemplate
      heroTitle="Vous pensez vendre à Rimouski en 2026 ou dans les prochains mois ?"
      addressPlaceholder="123 Rue Exemple, Rimouski"
      mapVariant="default"
      mapText="tous les secteurs de Rimouski"
      imageVariant="rimouski"
    />
  )
}
