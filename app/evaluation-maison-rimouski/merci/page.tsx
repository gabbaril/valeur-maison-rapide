import { LandingPageTemplate } from "@/components/landing-page-template"

export default function Page() {
  return <LandingPageTemplate 
    showMerci={true}
    heroTitle="Vous pensez vendre à Québec en 2026 ou dans les prochains mois ?"
    addressPlaceholder="123 Rue Exemple, Québec"
    mapVariant="quebec"
    mapText="tous les arrondissements de Québec"
    imageVariant="quebec"
  />
}
