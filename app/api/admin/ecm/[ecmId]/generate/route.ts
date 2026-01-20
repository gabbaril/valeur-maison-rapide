import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest, { params }: { params: { ecmId: string } }) {
  try {
    const supabase = getSupabaseAdmin()
    const ecmId = params.ecmId

    const { data: ecm, error: ecmError } = await supabase.from("ecm_reports").select("*").eq("id", ecmId).single()

    if (ecmError || !ecm) {
      return NextResponse.json({ error: "ECM not found" }, { status: 404 })
    }

    const subject = ecm.subject_property_snapshot as any
    const comparables = ecm.comparables as any[]
    const notes = ecm.analyst_notes || ""
    const rangeLow = ecm.range_low
    const rangeHigh = ecm.range_high

    let generatedText = `**ÉVALUATION COMPARATIVE DE MARCHÉ**\n\n`

    // Résumé de la propriété
    generatedText += `**PROPRIÉTÉ ANALYSÉE**\n\n`
    generatedText += `Adresse: ${subject.address || "N/A"}, ${subject.city || ""}\n`
    generatedText += `Type: ${subject.property_type || "N/A"}\n`
    if (subject.bedrooms) generatedText += `Chambres: ${subject.bedrooms}\n`
    if (subject.bathrooms) generatedText += `Salles de bain: ${subject.bathrooms}\n`
    if (subject.year_built) generatedText += `Année de construction: ${subject.year_built}\n`
    if (subject.living_area) generatedText += `Superficie: ${subject.living_area}\n`
    if (subject.garage) generatedText += `Garage: ${subject.garage}\n`
    if (subject.features) generatedText += `\nCaractéristiques: ${subject.features}\n`
    if (subject.renovations) generatedText += `Rénovations: ${subject.renovations}\n`

    // Analyse des comparables
    if (comparables && comparables.length > 0) {
      generatedText += `\n\n**ANALYSE DES COMPARABLES**\n\n`
      generatedText += `Nous avons analysé ${comparables.length} propriété(s) comparable(s) dans le secteur:\n\n`

      comparables.forEach((comp: any, index: number) => {
        generatedText += `${index + 1}. ${comp.label || `Comparable #${index + 1}`}\n`
        if (comp.sector) generatedText += `   Secteur: ${comp.sector}\n`
        if (comp.price) generatedText += `   Prix: ${comp.price}\n`
        if (comp.date) generatedText += `   Date: ${comp.date}\n`
        if (comp.bedrooms || comp.bathrooms) {
          generatedText += `   Configuration: ${comp.bedrooms || "N/A"} ch., ${comp.bathrooms || "N/A"} s.b.\n`
        }
        if (comp.area) generatedText += `   Superficie: ${comp.area}\n`
        if (comp.adjustment) generatedText += `   Ajustement: ${comp.adjustment}\n`
        if (comp.notes) generatedText += `   Notes: ${comp.notes}\n`
        generatedText += `\n`
      })

      generatedText += `Les comparables sélectionnés présentent des caractéristiques similaires à la propriété analysée en termes de localisation, type de propriété, superficie et configuration.\n`
    }

    // Notes de l'analyste
    if (notes) {
      generatedText += `\n**NOTES DE L'ANALYSTE**\n\n${notes}\n`
    }

    // Conclusion avec fourchette
    generatedText += `\n**CONCLUSION**\n\n`
    if (rangeLow && rangeHigh) {
      generatedText += `Après analyse approfondie du marché et des comparables, nous estimons la valeur marchande de cette propriété dans une fourchette de **${rangeLow.toLocaleString("fr-CA")} $ à ${rangeHigh.toLocaleString("fr-CA")} $**.\n\n`
    } else {
      generatedText += `Sur la base des comparables analysés et des conditions actuelles du marché, une évaluation plus précise nécessiterait une inspection sur place et l'analyse de données de marché supplémentaires.\n\n`
    }

    generatedText += `Cette évaluation comparative constitue une estimation préliminaire basée sur les informations disponibles et les données de marché récentes. Pour une évaluation officielle, nous recommandons une visite de la propriété.\n`

    const { error: updateError } = await supabase
      .from("ecm_reports")
      .update({
        generated_text: generatedText,
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ecmId)

    if (updateError) {
      return NextResponse.json({ error: "Failed to save generated text" }, { status: 500 })
    }

    return NextResponse.json({ generated_text: generatedText })
  } catch (error) {
    console.error("[v0] Error in POST /api/admin/ecm/[ecmId]/generate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
