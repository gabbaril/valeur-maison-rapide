import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { leadEmail, leadName, customSubject, customBody, templateType, leadToken } = await request.json()

    const isReminderTemplate = templateType === "reminder"

const defaultReminderMain =
  "Complétez votre fiche d'évaluation immobilière pour obtenir une estimation plus précise et détaillée de votre propriété."

const defaultReminderAfterCta =
  "N.B.: Les demandes avec fiche complétée sont traitées en priorité.\n\nNotre équipe vous contactera rapidement après réception."

const normalizeReminderBody = (text: string) => {
  const t = (text ?? "").trim()

  const idx = t.toLowerCase().indexOf("n.b.")
  const mainOnly = idx >= 0 ? t.slice(0, idx).trim() : t

  return mainOnly
}


const safeBody = (customBody ?? "").trim()

// IMPORTANT: pour reminder, on enlève tout "Bonjour..." au début du body
const reminderBody = normalizeReminderBody(safeBody)


// Texte principal: si vide, fallback vers le texte par défaut
const reminderMain = reminderBody || defaultReminderMain

// HTML (retours de ligne)
const formattedReminderMain = reminderMain.replace(/\n/g, "<br/>")
const formattedReminderAfterCta = defaultReminderAfterCta.replace(/\n/g, "<br/>")

// Pour les autres templates (non-reminder): body obligatoire
if (!isReminderTemplate && safeBody === "") {
  return NextResponse.json({ error: "Missing email body" }, { status: 400 })
}

// Pour non-reminder: on garde formattedBody
const formattedBody = safeBody.replace(/\n/g, "<br/>")

    // </CHANGE>

    let emailHtml = ""

    if (isReminderTemplate && leadToken) {
      const finalizationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://valeurmaisonrapide.com"}/finaliser?token=${leadToken}`

      emailHtml = `
<div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">

          <h2 style="color: #dc2626; margin-bottom: 20px;">Valeur Maison Rapide</h2>
          <p style="margin-bottom: 15px;">Bonjour ${leadName},</p>
<p style="margin-bottom: 20px;">${formattedReminderMain}</p>

          
          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
            <tr>
              <td style="padding: 20px; background-color: #fef2f2; border: 2px solid #dc2626; border-radius: 8px;">
     <p style="margin: 0 0 15px 0; font-weight: bold; color: #dc2626; font-size: 16px; text-align: center;">
  ⚡ Accélérez votre évaluation (2 minutes)
</p>

                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding: 10px 0;">
                      <a href="${finalizationUrl}" 
                         style="display: block; background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; text-align: center; max-width: 280px; margin: 0 auto;">
                        Finaliser ma fiche d'évaluation
                      </a>
                    </td>
                  </tr>
                </table>
<p style="margin: 15px 0 0; font-size: 13px; color: #555; text-align: center;">
Lien alternatif :
  <a href="${finalizationUrl}" style="color: #dc2626; text-decoration: underline;">
    Ouvrir la fiche d'évaluation
  </a>
</p>

<p style="margin: 14px 0 0; font-size: 12px; color: #777; line-height: 1.4; text-align: center;">
  ⏱️ Ce lien est valide pendant 72 heures et ne peut être utilisé qu'une seule fois.
</p>


              </td>
            </tr>
</table>

<p style="margin-top: 20px;">${formattedReminderAfterCta}</p>

<p style="margin-top: 30px;">Cordialement,<br/>L'équipe Valeur Maison Rapide</p>

        </div>
      `
    } else {
      // Standard disqualification templates
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Valeur Maison Rapide</h2>
          <p>Bonjour ${leadName},</p>
          <p>${
            templateType === "standard"
              ? "Merci d'avoir pris le temps de soumettre votre demande d'évaluation immobilière via Valeur Maison Rapide."
              : templateType === "followup"
                ? "Merci d'avoir contacté Valeur Maison Rapide pour votre projet immobilier."
                : templateType === "short"
                  ? "Nous avons bien reçu votre demande."
                  : "Merci pour votre demande d'évaluation immobilière."
          }</p>
          <p>${formattedBody}</p>
          <p>${
            templateType === "followup"
              ? "N'hésitez pas à nous contacter à nouveau lorsque vous serez prêt."
              : templateType === "short"
                ? "Merci de votre compréhension."
                : "Nous vous souhaitons beaucoup de succès dans vos démarches futures."
          }</p>
          <p style="margin-top: 30px;">Cordialement,<br/>L'équipe Valeur Maison Rapide</p>
        </div>
      `
    }

    const { data, error } = await resend.emails.send({
      from: "Valeur Maison Rapide <nepasrepondre@valeurmaisonrapide.com>",
      to: [leadEmail],
      subject: customSubject || "Valeur Maison Rapide - Mise à jour de votre demande",
      html: emailHtml,
    })

    if (error) {
      console.error("[v0] Error sending email:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Error in disqualify-lead API:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
