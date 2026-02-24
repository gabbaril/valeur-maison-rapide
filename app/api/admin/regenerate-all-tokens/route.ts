import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    // Verify admin password
    if (password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get all leads
    const { data: leads, error: leadsError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })

    if (leadsError) {
      console.error("Error fetching leads:", leadsError)
      return NextResponse.json({ error: "Erreur récupération leads" }, { status: 500 })
    }

    const results = {
      total: leads.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each lead
    for (const lead of leads) {
      try {
        // Delete old tokens for this lead
        await supabase.from("lead_access_tokens").delete().eq("lead_id", lead.id)

        // Generate new token (no time-based expiration - valid until lead is finalized)
        const token = `${lead.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`
        // Set a far future date for expires_at to maintain DB schema compatibility
        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 100)

        // Insert new token
        const { error: tokenError } = await supabase.from("lead_access_tokens").insert({
          lead_id: lead.id,
          token: token,
          expires_at: expiresAt.toISOString(),
          is_used: false,
        })

        if (tokenError) {
          throw new Error(`Token creation failed: ${tokenError.message}`)
        }

        const trackingSection =
          lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.referrer
            ? `
          <tr><td colspan="2" style="padding: 16px 0 8px 0;"><hr style="border: none; border-top: 1px solid #ddd;" /></td></tr>
          <tr><td colspan="2" style="padding: 0 0 8px 0; font-weight: bold; color: #666;">Source du lead</td></tr>
          <tr><td style="padding: 4px 0; font-weight: bold;">Source:</td><td>${lead.utm_source || "Direct"}</td></tr>
          ${lead.utm_medium ? `<tr><td style="padding: 4px 0; font-weight: bold;">Medium:</td><td>${lead.utm_medium}</td></tr>` : ""}
          ${lead.utm_campaign ? `<tr><td style="padding: 4px 0; font-weight: bold;">Campagne:</td><td>${lead.utm_campaign}</td></tr>` : ""}
          ${lead.referrer ? `<tr><td style="padding: 4px 0; font-weight: bold;">Referrer:</td><td>${lead.referrer}</td></tr>` : ""}
        `
            : ""

        const finalizeUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.valeurmaisonrapide.com"}/admin/finaliser?token=${token}`

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Nouveau lead - Évaluation immobilière</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Nom complet:</td><td>${lead.full_name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Courriel:</td><td><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone:</td><td><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Adresse:</td><td>${lead.address}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Type de propriété:</td><td>${lead.property_type}</td></tr>
              ${trackingSection}
              <tr><td colspan="2" style="padding: 20px 0;">
                <a href="${finalizeUrl}" 
                   style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:16px;padding:14px 28px;border-radius:8px;">
                  Finaliser la fiche du lead
                </a>
              </td></tr>
              <tr><td colspan="2" style="padding: 0 0 12px 0; font-size: 12px; color: #666;">
                Ce lien reste valide jusqu'à ce que votre fiche soit complétée. Il ne peut être utilisé qu'une seule fois.
              </td></tr>
            </table>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Email envoyé depuis valeurmaisonrapide.com</p>
          </div>
        `

        await resend.emails.send({
          from: "Valeur Maison <nepasrepondre@cap2b.ca>",
          to: process.env.LEAD_TO_EMAIL!,
          subject: `Lead #${lead.lead_number} – ${lead.full_name} – ${lead.address}`,
          html: emailHtml,
        })

        results.success++

        await delay(1000)
      } catch (error) {
        results.failed++
        results.errors.push(`Lead ${lead.id}: ${error instanceof Error ? error.message : "Unknown error"}`)

        if (error instanceof Error && error.message.includes("429")) {
          await delay(2000)
        }
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error("Error regenerating tokens:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
