import { Resend } from "resend"
import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ ok: false, error: "RESEND_API_KEY non configuré" }, { status: 500 })
  }

  if (!process.env.LEAD_TO_EMAIL) {
    return NextResponse.json({ ok: false, error: "LEAD_TO_EMAIL non configuré" }, { status: 500 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  try {
    const body = await request.json()
    const {
      fullName,
      email,
      phone,
      address,
      propertyType,
      intention,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      referrer,
      conversion_url,
    } = body

    function normalizeFullName(input: string): string {
      return input
        .replace(/[’‘]/g, "'")
        .replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ'-]+/g, " ")
        .replace(/\b[-']+|[-']+\b/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map(word =>
          word
            .split("-")
            .map(part =>
              part
                .split("'")
                .map(
                  segment =>
                    segment.charAt(0).toUpperCase() +
                    segment.slice(1).toLowerCase()
                )
                .join("'")
            )
            .join("-")
        )
        .join(" ");
    }

    const normalizedName = normalizeFullName(fullName || "");
    let first_name: string | null = null;
    let last_name: string | null = null;

    if (normalizedName) {
      const parts = normalizedName.split(" ");

      first_name = parts[0] || null;

      last_name = parts.length > 1 ? parts.slice(1).join(" ") : null;
    }

    const now = new Date()
    const montrealTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Montreal" }))
    const leadId = `${montrealTime.getFullYear()}${String(montrealTime.getMonth() + 1).padStart(2, "0")}${String(montrealTime.getDate()).padStart(2, "0")}-${String(montrealTime.getHours()).padStart(2, "0")}${String(montrealTime.getMinutes()).padStart(2, "0")}`

    let leadDbId: string | null = null
    let accessToken: string | null = null

    try {
      const supabase = getSupabaseAdmin()

      const addressParts = address.split(",")
      const city = addressParts.length > 1 ? addressParts[1].trim() : null

      const { data: leadData, error: dbError } = await supabase
        .from("leads")
        .insert({
          lead_number: leadId,
          full_name: normalizedName,
          first_name: first_name,
          last_name: last_name,
          email: email,
          phone: phone,
          address: address,
          city: city,
          property_type: propertyType,
          intention: intention || "Non spécifiée",
          status: "unassigned",
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          referrer: referrer || null,
          conversion_url: conversion_url || null,
        })
        .select()
        .single()

      if (dbError) {
        console.error("[v0] Erreur lors de la sauvegarde du lead dans Supabase:", dbError)
      } else {
        console.log("[v0] Lead sauvegardé dans Supabase avec ID:", leadData?.id)
        leadDbId = leadData?.id

        // Generate secure access token (no time-based expiration - valid until lead is finalized)
        accessToken = `${leadData.id}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
        // Set a far future date for expires_at to maintain DB schema compatibility
        const expiresAt = new Date()
        expiresAt.setFullYear(expiresAt.getFullYear() + 100)

        await supabase.from("lead_access_tokens").insert({
          lead_id: leadData.id,
          token: accessToken,
          expires_at: expiresAt.toISOString(),
        })
      }
    } catch (dbErr: any) {
      console.error("[v0] Exception lors de la sauvegarde Supabase:", dbErr.message)
    }

    const trackingSection = `
      <tr><td colspan="2" style="padding: 16px 0 8px 0;"><hr style="border: none; border-top: 1px solid #ddd;" /></td></tr>
      <tr><td colspan="2" style="padding: 0 0 8px 0; font-weight: bold; color: #666;">Source du lead</td></tr>
      <tr><td style="padding: 4px 0; font-weight: bold;">Source:</td><td>${utm_source || "Direct"}</td></tr>
      ${utm_medium ? `<tr><td style="padding: 4px 0; font-weight: bold;">Medium:</td><td>${utm_medium}</td></tr>` : ""}
      ${utm_campaign ? `<tr><td style="padding: 4px 0; font-weight: bold;">Campagne:</td><td>${utm_campaign}</td></tr>` : ""}
      ${utm_content ? `<tr><td style="padding: 4px 0; font-weight: bold;">Contenu:</td><td>${utm_content}</td></tr>` : ""}
      ${utm_term ? `<tr><td style="padding: 4px 0; font-weight: bold;">Terme:</td><td>${utm_term}</td></tr>` : ""}
      ${referrer ? `<tr><td style="padding: 4px 0; font-weight: bold;">Referrer:</td><td>${referrer}</td></tr>` : ""}
      ${conversion_url ? `<tr><td style="padding: 4px 0; font-weight: bold;">Conversion URL:</td><td><a href="${conversion_url}">${conversion_url}</a></td></tr>` : ""}
    `

    const finaliseUrl = accessToken
      ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.valeurmaisonrapide.com"}/finaliser?token=${accessToken}`
      : null

    const finalizationCTA = finaliseUrl
      ? `
        <tr>
          <td style="padding:20px 24px 18px 24px;">
            <div style="margin:24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:separate;border-spacing:0;border:2px solid #C9342C;border-radius:16px;background:#FFF5F5;">
                <tr>
                  <td style="padding:20px 18px 16px 18px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                    <div style="font-size:18px;line-height:24px;font-weight:700;color:#C9342C;margin:0 0 10px 0;">
                      ⚡ Accélérez votre évaluation (2 minutes)
                    </div>

                    <div style="font-size:14px;line-height:22px;color:#374151;margin:0 0 14px 0;">
                      Pour obtenir une estimation <strong>plus précise</strong> et <strong>plus rapidement</strong>, merci de compléter votre fiche immobilière.
                    </div>

                    <div style="font-size:14px;line-height:22px;color:#374151;margin:0 0 16px 0;">
                      <strong>Les demandes avec une fiche immobilière complétée sont traitées en priorité.</strong>
                    </div>

                    <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-spacing:0;">
                      <tr>
                        <td bgcolor="#C9342C" style="border-radius:12px;">
                          <a href="${finaliseUrl}"
                             target="_blank"
                             style="display:inline-block;padding:12px 18px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
                            Accélérer mon estimation (2 minutes)
                          </a>
                        </td>
                      </tr>
                    </table>

                    <div style="margin-top:12px;font-size:13px;line-height:20px;color:#6B7280;">
                      👉 <a href="${finaliseUrl}" target="_blank" style="color:#C9342C;text-decoration:underline;">Cliquez ici si le bouton ne fonctionne pas</a>
                    </div>

                    <div style="margin-top:10px;font-size:12px;line-height:18px;color:#6B7280;">
                      Ce lien reste valide jusqu'à ce que votre fiche soit complétée. Elle ne peut être soumise qu'une seule fois.
                    </div>
                  </td>
                </tr>
              </table>
            </div>
          </td>
        </tr>
      `
      : ""

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px;">Nouveau lead - Évaluation immobilière</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; font-weight: bold;">Nom complet:</td><td>${normalizedName}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Courriel:</td><td><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Téléphone:</td><td><a href="tel:${phone}">${phone}</a></td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Adresse:</td><td>${address}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Type de propriété:</td><td>${propertyType}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Intention:</td><td>${intention || "Non spécifiée"}</td></tr>
          ${trackingSection}
          ${finalizationCTA}
        </table>
        <p style="color: #666; font-size: 12px; margin-top: 20px;">Email envoyé depuis valeurmaisonrapide.com</p>
      </div>
    `

    const { data, error } = await resend.emails.send({
      from: "Valeur Maison <nepasrepondre@valeurmaisonrapide.com>",
      to: process.env.LEAD_TO_EMAIL,
      subject: `Lead #${leadId} – ${normalizedName} – ${address}`,
      html: emailHtml,
    })

    if (error) {
      console.log("[v0] Erreur lors de l'envoi du lead à l'équipe:", error)
      return NextResponse.json({ ok: false, error: `Erreur Resend: ${error.message}` }, { status: 500 })
    }

    console.log("[v0] Lead envoyé avec succès. Envoi de la confirmation à:", email)

//     if (email && email.includes("@")) {
//       try {
//         const leadGreeting = fullName ? `Bonjour ${fullName},` : "Bonjour,"
//         const websiteUrl = "https://www.valeurmaisonrapide.com"

//         const confirmationHtml = `<!doctype html>
// <html lang="fr">
//   <head>
//     <meta charset="utf-8" />
//     <meta name="viewport" content="width=device-width,initial-scale=1" />
//     <meta name="x-apple-disable-message-reformatting" />
//     <title>Nous avons bien reçu votre demande d'évaluation</title>
//   </head>
//   <body style="margin:0;padding:0;background:#f6f7fb;">
//     <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
//       Nous avons bien reçu votre demande d'évaluation. Analyse en cours (24–48 h).
//     </div>

//     <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f6f7fb;">
//       <tr>
//         <td align="center" style="padding:24px 12px;">
//           <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="width:600px;max-width:600px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(16,24,40,0.08);">
//             <tr>
//               <td style="padding:20px 24px;border-bottom:1px solid #eef0f4;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
//                   <tr>
//                     <td align="left" style="vertical-align:middle;">
//                       <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;color:#d6001c;">Valeur Maison Rapide</span>
//                     </td>
//                     <td align="right" style="vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#667085;">
//                       Confirmation de réception
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding:28px 24px 10px 24px;">
//                 <div style="font-family:Arial,Helvetica,sans-serif;font-size:22px;line-height:1.25;font-weight:800;color:#101828;margin:0 0 10px;">
//                   ✅ Demande d'évaluation reçue
//                 </div>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding:0 24px 18px 24px;">
//                 <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #eef0f4;border-radius:14px;">
//                   <tr>
//                     <td style="padding:16px 16px 14px 16px;">
//                       <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#344054;margin:0 0 12px;">
//                         ${leadGreeting}
//                       </div>

//                       <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#344054;margin:0 0 10px;">
//                         Nous avons bien reçu votre demande d'évaluation immobilière.
//                       </div>

//                       <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#344054;margin:0;">
//                         Notre analyse est actuellement en cours et repose sur l'étude des propriétés comparables dans votre secteur.
//                         Un <b>expert immobilier local</b> validera l'estimation afin d'obtenir la valeur la plus précise possible.
//                       </div>

//                       <div style="height:12px;line-height:12px;font-size:1px;">&nbsp;</div>

//                       <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#344054;margin:0;">
//                         Si des informations supplémentaires sont nécessaires, vous serez contacté dans les prochaines <b>24 à 48 heures</b>.
//                       </div>
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             ${finalizationCTA}

//             <tr>
//               <td style="padding:0 24px 24px 24px;">
//                 <table role="presentation" cellpadding="0" cellspacing="0">
//                   <tr>
//                     <td align="left">
//                       <a href="${websiteUrl}"
//                          style="display:inline-block;background:#d6001c;color:#ffffff;text-decoration:none;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:14px;line-height:16px;padding:12px 16px;border-radius:12px;">
//                         Revenir au site
//                       </a>
//                     </td>
//                     <td style="width:12px;"></td>
//                     <td align="left" style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#667085;">
//                       ${websiteUrl}
//                     </td>
//                   </tr>
//                 </table>
//               </td>
//             </tr>

//             <tr>
//               <td style="padding:16px 24px 22px 24px;border-top:1px solid #eef0f4;">
//                 <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#667085;">
//                   Merci pour votre confiance,<br/>
//                   <b>Valeur Maison Rapide</b>
//                 </div>
//                 <div style="height:10px;line-height:10px;font-size:1px;">&nbsp;</div>
//                 <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#98a2b3;">
//                   Si vous n'avez pas fait cette demande, vous pouvez ignorer ce message.
//                 </div>
//               </td>
//             </tr>
//           </table>

//           <div style="height:18px;line-height:18px;font-size:1px;">&nbsp;</div>

//           <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.6;color:#98a2b3;text-align:center;max-width:600px;">
//             © Valeur Maison Rapide — Tous droits réservés
//           </div>
//         </td>
//       </tr>
//     </table>
//   </body>
// </html>`

//         const confirmationText = `${leadGreeting}

// Nous avons bien reçu votre demande d'évaluation immobilière.

// Notre analyse est actuellement en cours de finalisation et repose sur l'étude des propriétés comparables dans votre secteur.
// Un expert immobilier local validera l'estimation afin d'obtenir la valeur la plus précise possible.

// Si des informations supplémentaires sont nécessaires, vous serez contacté dans les prochaines 24 à 48 heures.

// Merci pour votre confiance,
// L'équipe de Valeur Maison Rapide
// ${websiteUrl}

// Si vous n'avez pas fait cette demande, vous pouvez ignorer ce message.`

//         await resend.emails.send({
//           from: "Valeur Maison Rapide <nepasrepondre@valeurmaisonrapide.com>",
//           to: email,
//           subject: "Demande d'évaluation reçue — Valeur Maison Rapide",
//           html: confirmationHtml,
//           text: confirmationText,
//         })

//         console.log("[v0] Courriel de confirmation envoyé avec succès à:", email)
//       } catch (confirmError: any) {
//         console.error("[v0] Erreur envoi confirmation au lead:", confirmError)
//         console.error("[v0] Détails erreur:", confirmError.message)
//       }
//     }

    return NextResponse.json({ ok: true, emailId: data?.id })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}
