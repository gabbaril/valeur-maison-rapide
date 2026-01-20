"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect } from "react"

const DEFAULT_REMINDER_SUBJECT = "Valeur Maison Rapide - Accélérer le processus de votre demande d'évaluation..."
const DEFAULT_REMINDER_BODY = `Complétez votre fiche d'évaluation immobilière pour obtenir une estimation plus précise et détaillée de votre propriété.

N.B.: Les demandes avec fiche complétée sont traitées en priorité.

Notre équipe vous contactera rapidement après réception.`

interface DisqualifyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedLead: { id: string; full_name: string; email: string } | null
  leadToken?: string | null
  template: string
  setTemplate: (template: string) => void
  customMessage: string
  setCustomMessage: (message: string) => void
  emailSubject: string
  setEmailSubject: (subject: string) => void
  emailBody: string
  setEmailBody: (body: string) => void
  isSending: boolean
  onSend: () => void
  generateEmailPreview: (templateType: string, customMessage: string, leadName: string) => any
}

export function DisqualifyDialog({
  open,
  onOpenChange,
  selectedLead,
  leadToken,
  template,
  setTemplate,
  customMessage,
  setCustomMessage,
  emailSubject,
  setEmailSubject,
  emailBody,
  setEmailBody,
  isSending,
  onSend,
}: DisqualifyDialogProps) {
  const finalizationLink = leadToken
    ? `${process.env.NEXT_PUBLIC_SITE_URL || "https://valeurmaisonrapide.com"}/finaliser?token=${leadToken}`
    : null

  useEffect(() => {
    if (open && template === "reminder") {
      if (!emailSubject || emailSubject === "") {
        setEmailSubject(DEFAULT_REMINDER_SUBJECT)
      }
      if (!emailBody || emailBody === "") {
        setEmailBody(DEFAULT_REMINDER_BODY)
      }
    }
  }, [open, template])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Envoyer un courriel au contact</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom du contact</label>
              <p className="text-sm text-gray-600">{selectedLead?.full_name}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Modèle de courriel</label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Rappel de finalisation</SelectItem>
                  <SelectItem value="standard">Message standard</SelectItem>
                  <SelectItem value="followup">Avec suivi futur</SelectItem>
                  <SelectItem value="short">Version courte</SelectItem>
                  <SelectItem value="resources">Avec ressources</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Personnalisez le contenu (optionnel)</label>
              <textarea
                className="w-full mt-1 p-2 border rounded-md min-h-[100px]"
                placeholder="Tapez ici pour modifier ou remplacer le message par défaut..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Laissez vide pour utiliser le message par défaut du modèle sélectionné
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onOpenChange(false)
                  setCustomMessage("")
                }}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button onClick={onSend} disabled={isSending} className="bg-red-600 hover:bg-red-700 flex-1">
                {isSending ? "Envoi en cours..." : "Envoyer le courriel"}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Aperçu du courriel</label>
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="bg-gray-100 p-3 border-b">
                  <div className="text-xs text-gray-600 mb-1">De: Valeur Maison Rapide</div>
                  <div className="text-xs text-gray-600 mb-1">À: {selectedLead?.email}</div>
                  <div className="text-xs text-gray-600 mb-2">Sujet:</div>
                  <input
                    type="text"
                    className="w-full p-2 text-sm border rounded bg-white"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Sujet de l'email"
                  />
                </div>

                <div className="p-6 bg-white">
                  <h2 className="text-red-600 text-xl font-bold mb-4">Valeur Maison Rapide</h2>
                  <p className="mb-3">Bonjour {selectedLead?.full_name || ""},</p>

                  {template === "reminder" ? (
                    <div className="mb-3" style={{ whiteSpace: "pre-line" }}>
                      {emailBody}
                    </div>
                  ) : (
                    <>
                      <p className="mb-3">
                        {template === "standard" &&
                          "Merci d'avoir pris le temps de soumettre votre demande d'évaluation immobilière via Valeur Maison Rapide."}
                        {template === "followup" &&
                          "Merci d'avoir contacté Valeur Maison Rapide pour votre projet immobilier."}
                        {template === "short" && "Nous avons bien reçu votre demande."}
                        {template === "resources" && "Merci pour votre demande d'évaluation immobilière."}
                      </p>

                      <textarea
                        className="w-full p-3 border rounded-md min-h-[120px] text-sm"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        placeholder="Corps principal du message..."
                      />
                    </>
                  )}

                  {template === "reminder" && finalizationLink && (
                    <div className="my-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg text-center">
                      <p className="text-gray-700 mb-4 font-medium">⚡ Accélérez votre évaluation (2 minutes)</p>
                      <a
                        href={finalizationLink}
                        style={{
                          display: "inline-block",
                          backgroundColor: "#dc2626",
                          color: "white",
                          padding: "14px 32px",
                          borderRadius: "8px",
                          textDecoration: "none",
                          fontWeight: "600",
                          fontSize: "16px",
                        }}
                      >
                        Finaliser ma fiche d'évaluation
                      </a>
                      <p className="text-xs text-gray-600 mt-4">
                        Ou copiez ce lien dans votre navigateur :<br />
                        <span className="text-blue-600">{finalizationLink}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Ce lien est valide pendant 72 heures et ne peut être utilisé qu'une seule fois.
                      </p>
                    </div>
                  )}

                  {customMessage && (
                    <div className="my-6 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                      <p className="text-gray-700 mb-4 font-medium">⚡ Message personnalisé</p>
                      <p className="text-sm">{customMessage}</p>
                    </div>
                  )}

                  {template !== "reminder" && (
                    <p className="mt-3 mb-3">
                      {template === "followup"
                        ? "N'hésitez pas à nous contacter à nouveau lorsque vous serez prêt."
                        : template === "short"
                          ? "Merci de votre compréhension."
                          : "Nous vous souhaitons beaucoup de succès dans vos démarches futures."}
                    </p>
                  )}

                  <p className="mt-6 text-sm">
                    Cordialement,
                    <br />
                    L'équipe Valeur Maison Rapide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
