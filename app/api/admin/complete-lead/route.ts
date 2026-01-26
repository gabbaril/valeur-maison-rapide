import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"
import { Resend } from "resend"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      token,
      form_type, // 'standard' or 'income_property'
      income_property_data, // Data for income property form
      notes,
      postal_code,
      // MOMENT IDÉAL DE CONTACT
      contact_weekday,
      contact_weekend,
      contact_notes,
      // INFORMATION SUR LA MAISON
      property_usage,
      owners_count,
      is_occupied,
      contact_person,
      construction_year,
      floors_count,
      basement_info,
      bedrooms_count,
      bathrooms_count,
      powder_rooms_count,
      approximate_area,
      recent_renovations,
      renovations_details,
      garage,
      property_highlights,
      // PROJET DE VENTE
      sale_reason,
      potential_sale_desire,
      property_to_sell_type,
      sector,
      ideal_sale_deadline,
      approximate_market_value,
      need_buying_help,
      buying_sector,
      buying_budget,
    } = body

    if (!token) {
      return NextResponse.json({ ok: false, error: "Token manquant" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Verify token
    const { data: tokenData, error: tokenError } = await supabase
      .from("lead_access_tokens")
      .select("*")
      .eq("token", token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 404 })
    }

    // Token validity is now based on is_used status, not time expiration
    if (tokenData.is_used) {
      return NextResponse.json(
        {
          ok: false,
          error: "Ce formulaire a déjà été soumis. Votre dossier est en cours de traitement.",
        },
        { status: 403 },
      )
    }

    const { data: leadData, error: leadError } = await supabase
      .from("leads")
      .select("*, brokers(*)")
      .eq("id", tokenData.lead_id)
      .single()

    if (leadError || !leadData) {
      return NextResponse.json({ ok: false, error: "Lead non trouvé" }, { status: 404 })
    }

    if (leadData.is_finalized) {
      return NextResponse.json(
        {
          ok: false,
          error: "Votre évaluation a déjà été complétée.",
        },
        { status: 403 },
      )
    }

    // Handle income property form submission
    if (form_type === "income_property" && income_property_data) {
      // Insert into evaluation_income_property table
      const { error: incomePropertyError } = await supabase.from("evaluation_income_property").insert({
        lead_id: tokenData.lead_id,
        units_count: income_property_data.units_count ? parseInt(income_property_data.units_count) : null,
        occupation_type: income_property_data.occupation_type || null,
        rent_unit_1: income_property_data.rent_unit_1 || null,
        rent_unit_2: income_property_data.rent_unit_2 || null,
        rent_unit_3: income_property_data.rent_unit_3 || null,
        rent_unit_4: income_property_data.rent_unit_4 || null,
        gross_monthly_revenue: income_property_data.gross_monthly_revenue || null,
        rented_units_count: income_property_data.rented_units_count
          ? parseInt(income_property_data.rented_units_count)
          : null,
        rent_includes_heating: income_property_data.rent_includes_heating || false,
        rent_includes_electricity: income_property_data.rent_includes_electricity || false,
        rent_includes_internet: income_property_data.rent_includes_internet || false,
        rent_includes_other: income_property_data.rent_includes_other || false,
        rent_includes_other_details: income_property_data.rent_includes_other_details || null,
        has_active_leases: income_property_data.has_active_leases || null,
        lease_renewal_date: income_property_data.lease_renewal_date || null,
        parking_info: income_property_data.parking_info || null,
        basement_info: income_property_data.basement_info || null,
        recent_renovations: income_property_data.recent_renovations || null,
        renovations_details: income_property_data.renovations_details || null,
        evaluation_reason: income_property_data.evaluation_reason || null,
        sale_planned: income_property_data.sale_planned || null,
        sale_horizon: income_property_data.sale_horizon || null,
        owner_estimated_value: income_property_data.owner_estimated_value || null,
        municipal_taxes: income_property_data.municipal_taxes || null,
        school_taxes: income_property_data.school_taxes || null,
        insurance: income_property_data.insurance || null,
        snow_maintenance: income_property_data.snow_maintenance || null,
        utilities_if_owner_paid: income_property_data.utilities_if_owner_paid || null,
        important_notes: income_property_data.important_notes || null,
      })

      if (incomePropertyError) {
        console.error("[v0] Error inserting income property data:", incomePropertyError)
        return NextResponse.json(
          {
            ok: false,
            error: "Erreur lors de l'enregistrement des données de l'immeuble à revenus",
            details: incomePropertyError.message,
          },
          { status: 500 },
        )
      }

      // Update lead as finalized
      const { error: updateError } = await supabase
        .from("leads")
        .update({
          is_finalized: true,
          finalized_at: new Date().toISOString(),
          // Store a reference that this is an income property evaluation
          sale_reason: income_property_data.evaluation_reason || null,
          potential_sale_desire: income_property_data.sale_planned || null,
          ideal_sale_deadline: income_property_data.sale_horizon || null,
          approximate_market_value: income_property_data.owner_estimated_value || null,
        })
        .eq("id", tokenData.lead_id)

      if (updateError) {
        console.error("[v0] Update error:", updateError)
        return NextResponse.json(
          {
            ok: false,
            error: "Erreur mise à jour lead",
            details: updateError.message,
          },
          { status: 500 },
        )
      }

      // Mark token as used
      await supabase
        .from("lead_access_tokens")
        .update({
          is_used: true,
          used_at: new Date().toISOString(),
        })
        .eq("id", tokenData.id)

      // Send notification email for income property
      if (process.env.RESEND_API_KEY && process.env.LEAD_TO_EMAIL) {
        const resend = new Resend(process.env.RESEND_API_KEY)

        const incomePropertyEmailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">✅ Lead finalisé - Immeuble à revenus - ${leadData.full_name}</h2>
            
            <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 0; font-weight: bold; color: #166534;">Le lead a complété sa fiche d'évaluation pour un immeuble à revenus.</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Lead #:</td><td>${leadData.lead_number}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Nom complet:</td><td>${leadData.full_name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${leadData.email}">${leadData.email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone:</td><td><a href="tel:${leadData.phone}">${leadData.phone}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Adresse:</td><td>${leadData.address}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Type:</td><td>${leadData.property_type}</td></tr>
            </table>

            <h3 style="color: #dc2626; margin-top: 24px;">🏢 INFORMATIONS SUR L'IMMEUBLE</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              ${income_property_data.units_count ? `<tr><td style="padding: 4px 0; font-weight: bold;">Nombre de logements:</td><td>${income_property_data.units_count}</td></tr>` : ""}
              ${income_property_data.occupation_type ? `<tr><td style="padding: 4px 0; font-weight: bold;">Type d'occupation:</td><td>${income_property_data.occupation_type}</td></tr>` : ""}
              ${income_property_data.gross_monthly_revenue ? `<tr><td style="padding: 4px 0; font-weight: bold;">Revenu brut mensuel:</td><td>${income_property_data.gross_monthly_revenue}</td></tr>` : ""}
              ${income_property_data.rented_units_count ? `<tr><td style="padding: 4px 0; font-weight: bold;">Unités louées:</td><td>${income_property_data.rented_units_count}</td></tr>` : ""}
              ${income_property_data.rent_unit_1 ? `<tr><td style="padding: 4px 0; font-weight: bold;">Loyer logement #1:</td><td>${income_property_data.rent_unit_1}</td></tr>` : ""}
              ${income_property_data.rent_unit_2 ? `<tr><td style="padding: 4px 0; font-weight: bold;">Loyer logement #2:</td><td>${income_property_data.rent_unit_2}</td></tr>` : ""}
              ${income_property_data.rent_unit_3 ? `<tr><td style="padding: 4px 0; font-weight: bold;">Loyer logement #3:</td><td>${income_property_data.rent_unit_3}</td></tr>` : ""}
              ${income_property_data.rent_unit_4 ? `<tr><td style="padding: 4px 0; font-weight: bold;">Loyer logement #4:</td><td>${income_property_data.rent_unit_4}</td></tr>` : ""}
              ${income_property_data.has_active_leases ? `<tr><td style="padding: 4px 0; font-weight: bold;">Baux en vigueur:</td><td>${income_property_data.has_active_leases}</td></tr>` : ""}
              ${income_property_data.lease_renewal_date ? `<tr><td style="padding: 4px 0; font-weight: bold;">Renouvellement baux:</td><td>${income_property_data.lease_renewal_date}</td></tr>` : ""}
              ${income_property_data.parking_info ? `<tr><td style="padding: 4px 0; font-weight: bold;">Stationnement:</td><td>${income_property_data.parking_info}</td></tr>` : ""}
              ${income_property_data.basement_info ? `<tr><td style="padding: 4px 0; font-weight: bold;">Sous-sol:</td><td>${income_property_data.basement_info}</td></tr>` : ""}
              ${income_property_data.recent_renovations ? `<tr><td style="padding: 4px 0; font-weight: bold;">Rénovations récentes:</td><td>${income_property_data.recent_renovations}</td></tr>` : ""}
              ${income_property_data.renovations_details ? `<tr><td style="padding: 4px 0; font-weight: bold;">Détails rénovations:</td><td>${income_property_data.renovations_details}</td></tr>` : ""}
            </table>

            <h3 style="color: #dc2626;">📋 OBJECTIF ET CONTEXTE</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              ${income_property_data.evaluation_reason ? `<tr><td style="padding: 4px 0; font-weight: bold;">Pour quelle raison souhaitez-vous obtenir une évaluation ?:</td><td>${income_property_data.evaluation_reason}</td></tr>` : ""}
              ${income_property_data.sale_planned ? `<tr><td style="padding: 4px 0; font-weight: bold;">Envisagez-vous de potentiellement vendre l'immeuble ?:</td><td>${income_property_data.sale_planned}</td></tr>` : ""}
              ${income_property_data.sale_horizon ? `<tr><td style="padding: 4px 0; font-weight: bold;">Horizon de vente:</td><td>${income_property_data.sale_horizon}</td></tr>` : ""}
              ${income_property_data.owner_estimated_value ? `<tr><td style="padding: 4px 0; font-weight: bold;">Selon-vous quelle est la valeur estimée de l'immeuble ?:</td><td>${income_property_data.owner_estimated_value}</td></tr>` : ""}
            </table>

            <h3 style="color: #dc2626;">💰 DÉPENSES ANNUELLES (OPTIONNEL)</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              ${income_property_data.municipal_taxes ? `<tr><td style="padding: 4px 0; font-weight: bold;">Taxes municipales:</td><td>${income_property_data.municipal_taxes}</td></tr>` : ""}
              ${income_property_data.school_taxes ? `<tr><td style="padding: 4px 0; font-weight: bold;">Taxes scolaires:</td><td>${income_property_data.school_taxes}</td></tr>` : ""}
              ${income_property_data.insurance ? `<tr><td style="padding: 4px 0; font-weight: bold;">Assurances:</td><td>${income_property_data.insurance}</td></tr>` : ""}
              ${income_property_data.snow_maintenance ? `<tr><td style="padding: 4px 0; font-weight: bold;">Déneigement/entretien:</td><td>${income_property_data.snow_maintenance}</td></tr>` : ""}
              ${income_property_data.utilities_if_owner_paid ? `<tr><td style="padding: 4px 0; font-weight: bold;">Électricité/chauffage (si payé):</td><td>${income_property_data.utilities_if_owner_paid}</td></tr>` : ""}
            </table>

            ${
              income_property_data.important_notes
                ? `
            <div style="background: #fef9c3; padding: 12px; border-radius: 8px; margin-top: 16px;">
              <p style="margin: 0; font-weight: bold; color: #854d0e;">Notes importantes:</p>
              <p style="margin: 8px 0 0 0; color: #854d0e;">${income_property_data.important_notes}</p>
            </div>
            `
                : ""
            }

            <p style="color: #666; font-size: 12px; margin-top: 24px;">Email envoyé automatiquement depuis valeurmaisonrapide.com</p>
          </div>
        `

        try {
          await resend.emails.send({
            from: "Valeur Maison <nepasrepondre@valeurmaisonrapide.com>",
            to: process.env.LEAD_TO_EMAIL,
            subject: `✅ Lead finalisé (Immeuble à revenus) - ${leadData.full_name} - ${leadData.address}`,
            html: incomePropertyEmailHtml,
          })
        } catch (emailError: any) {
          console.error("[v0] Erreur envoi email de finalisation:", emailError)
        }
      }

      return NextResponse.json({ ok: true })
    }

    // Standard form submission (existing logic)
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        is_finalized: true,
        finalized_at: new Date().toISOString(),
        postal_code: postal_code || null,
        // MOMENT IDÉAL DE CONTACT
        contact_weekday: contact_weekday || null,
        contact_weekend: contact_weekend || null,
        contact_notes: contact_notes || null,
        // INFORMATION SUR LA MAISON
        property_usage: property_usage || null,
        owners_count: owners_count ? Number.parseInt(owners_count) : null,
        is_occupied:
          is_occupied === "Propriétaire occupant"
            ? true
            : is_occupied === "Locataire"
              ? false
              : is_occupied === "Vacant"
                ? null
                : null,
        contact_person: contact_person || null,
        construction_year: construction_year ? Number.parseInt(construction_year) : null,
        floors_count: floors_count || null,
        basement_info: basement_info || null,
        bedrooms_count: bedrooms_count ? Number.parseInt(bedrooms_count) : null,
        bathrooms_count: bathrooms_count ? Number.parseInt(bathrooms_count) : null,
        powder_rooms_count: powder_rooms_count ? Number.parseInt(powder_rooms_count) : null,
        approximate_area: approximate_area || null,
        recent_renovations: recent_renovations === "Oui" ? true : recent_renovations === "Non" ? false : null,
        renovations_details: renovations_details || null,
        garage: garage || null,
        property_highlights: property_highlights || null,
        // PROJET DE VENTE
        sale_reason: sale_reason || null,
        potential_sale_desire: potential_sale_desire || null,
        property_to_sell_type: property_to_sell_type || null,
        sector: sector || null,
        ideal_sale_deadline: ideal_sale_deadline || null,
        approximate_market_value: approximate_market_value || null,
        need_buying_help:
          need_buying_help === "Oui"
            ? true
            : need_buying_help === "Non"
              ? false
              : need_buying_help === "Peut-être"
                ? null
                : null,
        buying_sector: buying_sector || null,
        buying_budget: buying_budget || null,
      })
      .eq("id", tokenData.lead_id)

    if (updateError) {
      console.error("[v0] Update error:", updateError)
      return NextResponse.json(
        {
          ok: false,
          error: "Erreur mise à jour lead",
          details: updateError.message,
          hint: updateError.hint,
        },
        { status: 500 },
      )
    }

    // Add note if provided
    if (notes && notes.trim()) {
      await supabase.from("lead_notes").insert({
        lead_id: tokenData.lead_id,
        note: notes,
        created_by: "admin",
      })
    }

    await supabase
      .from("lead_access_tokens")
      .update({
        is_used: true,
        used_at: new Date().toISOString(),
      })
      .eq("id", tokenData.id)

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY)

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px;">✅ Lead finalisé - ${leadData.full_name}</h2>
          
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0; font-weight: bold; color: #166534;">Le lead a complété sa fiche avec toutes les informations détaillées.</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; font-weight: bold;">Lead #:</td><td>${leadData.lead_number}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Nom complet:</td><td>${leadData.full_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td><a href="mailto:${leadData.email}">${leadData.email}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone:</td><td><a href="tel:${leadData.phone}">${leadData.phone}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: bold;">Adresse:</td><td>${leadData.address}</td></tr>
            ${leadData.brokers ? `<tr><td style="padding: 8px 0; font-weight: bold;">Courtier assigné:</td><td>${leadData.brokers.full_name} (${leadData.brokers.email})</td></tr>` : ""}
          </table>

          <h3 style="color: #dc2626; margin-top: 24px;">📋 PROJET DE VENTE</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            ${sale_reason ? `<tr><td style="padding: 4px 0; font-weight: bold;">Raison de vente:</td><td>${sale_reason}</td></tr>` : ""}
            ${potential_sale_desire ? `<tr><td style="padding: 4px 0; font-weight: bold;">Désir de vente:</td><td>${potential_sale_desire}</td></tr>` : ""}
            ${property_to_sell_type ? `<tr><td style="padding: 4px 0; font-weight: bold;">Type de propriété:</td><td>${property_to_sell_type}</td></tr>` : ""}
            ${sector ? `<tr><td style="padding: 4px 0; font-weight: bold;">Secteur:</td><td>${sector}</td></tr>` : ""}
            ${ideal_sale_deadline ? `<tr><td style="padding: 4px 0; font-weight: bold;">Délai idéal:</td><td>${ideal_sale_deadline}</td></tr>` : ""}
            ${approximate_market_value ? `<tr><td style="padding: 4px 0; font-weight: bold;">Valeur approximative:</td><td>${approximate_market_value}</td></tr>` : ""}
            ${need_buying_help ? `<tr><td style="padding: 4px 0; font-weight: bold;">Besoin d'aide pour achat:</td><td>${need_buying_help}</td></tr>` : ""}
            ${buying_sector ? `<tr><td style="padding: 4px 0; font-weight: bold;">Secteur d'achat:</td><td>${buying_sector}</td></tr>` : ""}
            ${buying_budget ? `<tr><td style="padding: 4px 0; font-weight: bold;">Budget d'achat:</td><td>${buying_budget}</td></tr>` : ""}
          </table>

          <h3 style="color: #dc2626;">🏠 INFORMATION SUR LA MAISON</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            ${property_usage ? `<tr><td style="padding: 4px 0; font-weight: bold;">Utilisation:</td><td>${property_usage}</td></tr>` : ""}
            ${owners_count ? `<tr><td style="padding: 4px 0; font-weight: bold;">Nombre de propriétaires:</td><td>${owners_count}</td></tr>` : ""}
            ${is_occupied ? `<tr><td style="padding: 4px 0; font-weight: bold;">Occupée:</td><td>${is_occupied}</td></tr>` : ""}
            ${contact_person ? `<tr><td style="padding: 4px 0; font-weight: bold;">Personne à contacter:</td><td>${contact_person}</td></tr>` : ""}
            ${construction_year ? `<tr><td style="padding: 4px 0; font-weight: bold;">Année de construction:</td><td>${construction_year}</td></tr>` : ""}
            ${floors_count ? `<tr><td style="padding: 4px 0; font-weight: bold;">Nombre d'étages:</td><td>${floors_count}</td></tr>` : ""}
            ${basement_info ? `<tr><td style="padding: 4px 0; font-weight: bold;">Sous-sol:</td><td>${basement_info}</td></tr>` : ""}
            ${bedrooms_count ? `<tr><td style="padding: 4px 0; font-weight: bold;">Chambres:</td><td>${bedrooms_count}</td></tr>` : ""}
            ${bathrooms_count ? `<tr><td style="padding: 4px 0; font-weight: bold;">Salles de bain:</td><td>${bathrooms_count}</td></tr>` : ""}
            ${powder_rooms_count ? `<tr><td style="padding: 4px 0; font-weight: bold;">Salles d'eau:</td><td>${powder_rooms_count}</td></tr>` : ""}
            ${approximate_area ? `<tr><td style="padding: 4px 0; font-weight: bold;">Superficie:</td><td>${approximate_area}</td></tr>` : ""}
            ${recent_renovations ? `<tr><td style="padding: 4px 0; font-weight: bold;">Rénovations récentes:</td><td>${recent_renovations}</td></tr>` : ""}
            ${renovations_details ? `<tr><td style="padding: 4px 0; font-weight: bold;">Détails rénovations:</td><td>${renovations_details}</td></tr>` : ""}
            ${garage ? `<tr><td style="padding: 4px 0; font-weight: bold;">Garage:</td><td>${garage}</td></tr>` : ""}
            ${property_highlights ? `<tr><td style="padding: 4px 0; font-weight: bold;">Points forts:</td><td>${property_highlights}</td></tr>` : ""}
          </table>

          <h3 style="color: #dc2626;">📅 MOMENT IDÉAL DE CONTACT</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
            ${contact_weekday ? `<tr><td style="padding: 4px 0; font-weight: bold;">Semaine:</td><td>${contact_weekday}</td></tr>` : ""}
            ${contact_weekend ? `<tr><td style="padding: 4px 0; font-weight: bold;">Fin de semaine:</td><td>${contact_weekend}</td></tr>` : ""}
            ${contact_notes ? `<tr><td style="padding: 4px 0; font-weight: bold;">Notes:</td><td>${contact_notes}</td></tr>` : ""}
          </table>

          ${
            notes
              ? `
          <div style="background: #fef9c3; padding: 12px; border-radius: 8px; margin-top: 16px;">
            <p style="margin: 0; font-weight: bold; color: #854d0e;">Note du lead:</p>
            <p style="margin: 8px 0 0 0; color: #854d0e;">${notes}</p>
          </div>
          `
              : ""
          }

          <div style="margin-top: 24px; padding: 16px; background: #f3f4f6; border-radius: 8px;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://www.valeurmaisonrapide.com"}/broker/leads/${leadData.id}" 
               style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:8px;">
              Voir les détails complets du lead
            </a>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 24px;">Email envoyé automatiquement depuis valeurmaisonrapide.com</p>
        </div>
      `

      try {
        // Send to admin
        if (process.env.LEAD_TO_EMAIL) {
          await resend.emails.send({
            from: "Valeur Maison <nepasrepondre@valeurmaisonrapide.com>",
            to: process.env.LEAD_TO_EMAIL,
            subject: `✅ Lead finalisé - ${leadData.full_name} - ${leadData.address}`,
            html: emailHtml,
          })
        }
      } catch (emailError: any) {
        console.error("[v0] Erreur envoi email de finalisation:", emailError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("[v0] Exception:", err)
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}
