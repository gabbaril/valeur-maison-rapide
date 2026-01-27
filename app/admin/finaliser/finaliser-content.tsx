"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import IncomePropertyEvaluationForm from "@/components/income-property-evaluation-form"

interface LeadFormData {
  // INFORMATION SUR LA MAISON
  property_usage: string
  owners_count: string
  is_occupied: string
  contact_person: string
  construction_year: string
  floors_count: string
  basement_info: string
  bedrooms_count: string
  bathrooms_count: string
  powder_rooms_count: string
  approximate_area: string
  recent_renovations: string
  renovations_details: string
  garage: string
  property_highlights: string

  // PROJET DE VENTE
  sale_reason: string
  potential_sale_desire: string
  property_to_sell_type: string
  sector: string
  ideal_sale_deadline: string
  approximate_market_value: string

  // FILTRAGE VENDEUR (CRM)
  niveau_intention: string
  ouverture_courtier: string
  horizon_vente: string
  souhaite_contact: string
  consent_courtier: boolean
}

// Helper function to determine if property type is an income property
function isIncomeProperty(propertyType: string | null | undefined): boolean {
  if (!propertyType) return false
  
  const incomePropertyTypes = [
    // New values
    "immeuble-revenus-4-et-moins",
    "immeuble-revenus-5-et-plus",
    "Immeubles à revenus (4 logements et -)",
    "Immeubles à revenus (5 logements et +)",
    // Legacy values for backward compatibility
    "duplex",
    "Duplex",
    "triplex",
    "Triplex",
    "quadruplex",
    "Quadruplex",
  ]
  
  return incomePropertyTypes.includes(propertyType)
}

export default function FinaliserContent({ token: tokenProp }: { token?: string | null } = {}) {
  const searchParams = useSearchParams()
  const token = tokenProp || searchParams?.get("token")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usedAt, setUsedAt] = useState<string | null>(null)
  const [lead, setLead] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2

  const [formData, setFormData] = useState<LeadFormData>({
    property_usage: "",
    owners_count: "",
    is_occupied: "",
    contact_person: "",
    construction_year: "",
    floors_count: "",
    basement_info: "",
    bedrooms_count: "",
    bathrooms_count: "",
    powder_rooms_count: "",
    approximate_area: "",
    recent_renovations: "",
    renovations_details: "",
    garage: "",
    property_highlights: "",
    sale_reason: "",
    potential_sale_desire: "",
    property_to_sell_type: "",
    sector: "",
    ideal_sale_deadline: "",
    approximate_market_value: "",
    // FILTRAGE VENDEUR (CRM)
    niveau_intention: "",
    ouverture_courtier: "",
    horizon_vente: "",
    souhaite_contact: "",
    consent_courtier: false,
  })

  useEffect(() => {
    if (!token) {
      setError("Token manquant dans l'URL")
      setLoading(false)
      return
    }

    fetch(`/api/admin/lead-by-token?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setLead(data.lead)
        } else {
          setError(data.error || "Erreur de chargement")
          if (data.used_at) {
            setUsedAt(data.used_at)
          }
        }
      })
      .catch(() => {
        setError("Erreur réseau")
      })
      .finally(() => setLoading(false))
  }, [token])

  const handleChange = (field: keyof LeadFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/admin/complete-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          form_type: "standard",
          ...formData,
        }),
      })

      const data = await res.json()

      if (data.ok) {
        setSuccess(true)
      } else {
        setError(data.error || "Erreur lors de la finalisation")
      }
    } catch (err) {
      setError("Erreur réseau")
    } finally {
      setSubmitting(false)
    }
  }

  const handleContinueClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    goToNextStep()
  }

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    goToPreviousStep()
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Chargement de votre dossier...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fiche d'évaluation déjà finalisée avec succès</h1>
            <p className="text-gray-600">
              Votre demande est maintenant en traitement prioritaire. L'expert local assigné à votre dossier vous
              contactera sous peu afin de vous présenter votre évaluation détaillée.
            </p>
            {usedAt && (
              <p className="text-sm text-gray-500 mt-2">
                Finalisé le{" "}
                {new Date(usedAt).toLocaleDateString("fr-CA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Fiche d'évaluation finalisée avec succès</h1>
            <p className="text-gray-600">
              Vos informations ont été enregistrées et votre demande est maintenant en traitement prioritaire. L'expert local assigné à votre dossier vous contactera sous peu afin de vous présenter votre évaluation détaillée.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  // Route to income property form if applicable
  if (lead && isIncomeProperty(lead.property_type)) {
    return (
      <IncomePropertyEvaluationForm
        lead={lead}
        token={token || ""}
        onSuccess={() => setSuccess(true)}
        onError={(err) => setError(err)}
      />
    )
  }

  // Standard evaluation form
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Finaliser l'analyse de votre projet immobilier
            </h1>
            <p className="text-sm text-gray-500 mb-2">Référence de dossier : {lead?.lead_number}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Étape {currentStep} sur {totalSteps}
                </span>
                <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% complété</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 bg-red-50 border border-red-600 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              Ces informations nous permettent de mieux comprendre votre propriété et votre projet immobilier, afin de déterminer les options les plus pertinentes dans votre situation.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 md:p-6 mb-6 space-y-3">
            <h2 className="font-semibold text-gray-900 mb-3">Vos informations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Nom complet:</span>
                <p className="text-gray-900">{lead?.full_name}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{lead?.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Téléphone:</span>
                <p className="text-gray-900">{lead?.phone}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Type de propriété:</span>
                <p className="text-gray-900">{lead?.property_type}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-medium text-gray-700">Adresse:</span>
                <p className="text-gray-900">{lead?.address}</p>
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <div>
              <div className="border-t-4 border-red-600 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-white bg-red-600 -mx-6 -mt-6 px-6 py-3 mb-6 rounded-t-lg">
                  Informations sur la propriété
                </h2>

                <div className="space-y-6">
                  {/* Pièces principales */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Nombre de pièces</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Chambres</label>
                        <input
                          type="number"
                          value={formData.bedrooms_count}
                          onChange={(e) => handleChange("bedrooms_count", e.target.value)}
                          placeholder="Ex.: 3"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Salles de bain</label>
                        <input
                          type="number"
                          value={formData.bathrooms_count}
                          onChange={(e) => handleChange("bathrooms_count", e.target.value)}
                          placeholder="Ex.: 2"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Salles d'eau</label>
                        <input
                          type="number"
                          value={formData.powder_rooms_count}
                          onChange={(e) => handleChange("powder_rooms_count", e.target.value)}
                          placeholder="Ex.: 1"
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Caractéristiques du bâtiment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Année de construction</label>
                      <input
                        type="text"
                        value={formData.construction_year}
                        onChange={(e) => handleChange("construction_year", e.target.value)}
                        placeholder="Ex.: 1974 ou 'Je ne sais pas'"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre d'étages</label>
                      <select
                        value={formData.floors_count}
                        onChange={(e) => handleChange("floors_count", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="1">1 étage</option>
                        <option value="2">2 étages</option>
                        <option value="3">3 étages ou plus</option>
                        <option value="Je ne sais pas">Je ne sais pas</option>
                      </select>
                    </div>
                  </div>

                  {/* Sous-sol */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Informations sur le sous-sol
                    </label>
                    <select
                      value={formData.basement_info}
                      onChange={(e) => handleChange("basement_info", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Sous-sol complet">Sous-sol complet</option>
                      <option value="Sous-sol partiel">Sous-sol partiel</option>
                      <option value="Vide sanitaire">Vide sanitaire</option>
                      <option value="Aucun">Aucun</option>
                      <option value="Je ne sais pas">Je ne sais pas</option>
                    </select>
                  </div>

                  {/* Stationnement */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Garage / Stationnement</label>
                    <select
                      value={formData.garage}
                      onChange={(e) => handleChange("garage", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Garage attaché">Garage attaché</option>
                      <option value="Garage détaché">Garage détaché</option>
                      <option value="Stationnement extérieur">Stationnement extérieur seulement</option>
                      <option value="Aucun">Aucun</option>
                    </select>
                  </div>

                  {/* Superficie terrain */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Superficie du terrain (approximative)
                    </label>
                    <input
                      type="text"
                      value={formData.approximate_area}
                      onChange={(e) => handleChange("approximate_area", e.target.value)}
                      placeholder="Ex: 40 000 pi² ou 'Je ne sais pas'"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>

                  {/* Rénovations */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Rénovations majeures récentes ?
                    </label>
                    <select
                      value={formData.recent_renovations}
                      onChange={(e) => handleChange("recent_renovations", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent mb-4"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Oui">Oui</option>
                      <option value="Non">Non</option>
                      <option value="Je ne sais pas">Je ne sais pas</option>
                    </select>

                    {formData.recent_renovations === "Oui" && (
                      <div className="pl-4 border-l-2 border-red-600">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Détails des rénovations</label>
                        <textarea
                          value={formData.renovations_details}
                          onChange={(e) => handleChange("renovations_details", e.target.value)}
                          rows={2}
                          placeholder="Ex: Cuisine rénovée en 2020, toiture remplacée..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Atouts */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Principaux atouts de la propriété (facultatif)
                    </label>
                    <textarea
                      value={formData.property_highlights}
                      onChange={(e) => handleChange("property_highlights", e.target.value)}
                      rows={3}
                      placeholder="Ex: Grande cour clôturée, piscine, proximité des services..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6">
                <Button
                  type="button"
                  onClick={handleContinueClick}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Continuer
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                <div className="border-t-4 border-red-600 bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-white bg-red-600 -mx-6 -mt-6 px-6 py-3 mb-6 rounded-t-lg">
                    Contexte de votre demande
                  </h2>
                  <p className="text-sm text-gray-500 mb-6">
                    Ces informations nous aident à interpréter correctement votre demande et à éviter des estimations trop générales.
                  </p>

                  <div className="space-y-6">
                    {/* Raison de la demande */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Quelle est la raison principale de votre demande ?
                      </label>
                      <select
                        value={formData.sale_reason}
                        onChange={(e) => handleChange("sale_reason", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Réflexion sur un changement résidentiel">Réflexion sur un changement résidentiel</option>
                        <option value="Achat éventuel d'une autre propriété">Achat éventuel d'une autre propriété</option>
                        <option value="Succession / contexte familial">Succession / contexte familial</option>
                        <option value="Projet à moyen terme">Projet à moyen terme</option>
                        <option value="Simple mise à jour de valeur">Simple mise à jour de valeur</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    {/* Horizon de temps */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Horizon envisagé pour votre projet immobilier
                      </label>
                      <select
                        value={formData.ideal_sale_deadline}
                        onChange={(e) => handleChange("ideal_sale_deadline", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="0-3 mois">0-3 mois</option>
                        <option value="3-6 mois">3-6 mois</option>
                        <option value="6-12 mois">6-12 mois</option>
                        <option value="Plus de 12 mois">Plus de 12 mois</option>
                        <option value="Je ne sais pas encore">Je ne sais pas encore</option>
                      </select>
                    </div>

                    {/* Valeur estimée */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Valeur que vous aviez en tête (si applicable)
                      </label>
                      <input
                        type="text"
                        value={formData.approximate_market_value}
                        onChange={(e) => handleChange("approximate_market_value", e.target.value)}
                        placeholder="Ex. 450 000 $ ou « je ne sais pas »"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>

                    {/* Occupation */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Statut d'occupation de la propriété
                      </label>
                      <select
                        value={formData.is_occupied}
                        onChange={(e) => handleChange("is_occupied", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Propriétaire occupant">Propriétaire occupant</option>
                        <option value="Locataire">Louée à un locataire</option>
                        <option value="Vacant">Vacante</option>
                      </select>
                    </div>

                    {/* Champs cachés */}
                    <input type="hidden" value={formData.property_usage} />
                    <input type="hidden" value={formData.owners_count} />
                    <input type="hidden" value={formData.contact_person} />
                    <input type="hidden" value={formData.property_to_sell_type} />
                    <input type="hidden" value={formData.sector} />
                  </div>
                </div>

                {/* FILTRAGE VENDEUR (CRM) */}
                <div className="border-t-4 border-red-600 bg-white p-6 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-white bg-red-600 -mx-6 -mt-6 px-6 py-3 mb-6 rounded-t-lg">
                    Vos préférences de contact
                  </h2>

                  <div className="space-y-6">
                    {/* Niveau d'intention de vente */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Comment décririez-vous votre niveau d'intention de vendre ?
                      </label>
                      <select
                        value={formData.niveau_intention}
                        onChange={(e) => handleChange("niveau_intention", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Très motivé">Très motivé - Je veux vendre rapidement</option>
                        <option value="Moyennement motivé">Moyennement motivé - Je considère mes options</option>
                        <option value="Juste curieux">Juste curieux - Je veux connaître la valeur</option>
                        <option value="Non déterminé">Non déterminé</option>
                      </select>
                    </div>

                    {/* Ouverture à travailler avec un courtier */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Si vous décidez de vendre, seriez-vous ouvert(e) à être accompagné(e) par un courtier immobilier ?
                      </label>
                      <select
                        value={formData.ouverture_courtier}
                        onChange={(e) => handleChange("ouverture_courtier", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Oui clairement">Oui, clairement</option>
                        <option value="Peut-être">Peut-être, selon les circonstances</option>
                        <option value="Non / déjà engagé">Non / J'ai déjà un courtier</option>
                        <option value="Non mentionné">Je préfère ne pas répondre</option>
                      </select>
                    </div>

                    {/* Horizon de vente */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Dans quel délai envisageriez-vous de vendre ?
                      </label>
                      <select
                        value={formData.horizon_vente}
                        onChange={(e) => handleChange("horizon_vente", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="< 3 mois">Moins de 3 mois</option>
                        <option value="3-6 mois">Entre 3 et 6 mois</option>
                        <option value="6-12 mois">Entre 6 et 12 mois</option>
                        <option value="> 12 mois">Plus de 12 mois</option>
                        <option value="Inconnu">Je ne sais pas encore</option>
                      </select>
                    </div>

                    {/* Souhaite être contacté */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Souhaitez-vous être contacté(e) par un courtier ?
                      </label>
                      <select
                        value={formData.souhaite_contact}
                        onChange={(e) => handleChange("souhaite_contact", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="Oui">Oui, je souhaite être contacté(e)</option>
                        <option value="Non">Non, pas pour le moment</option>
                        <option value="À recontacter plus tard">À recontacter plus tard</option>
                      </select>
                    </div>

                    {/* Consentement courtier */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.consent_courtier}
                          onChange={(e) => setFormData((prev) => ({ ...prev, consent_courtier: e.target.checked }))}
                          className="mt-1 h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                        />
                        <span className="text-sm text-gray-700">
                          J'accepte que mes coordonnées soient transmises à un courtier immobilier partenaire de mon secteur pour me contacter et m'accompagner dans mon projet de vente.
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <Button
                  type="button"
                  onClick={handleBackClick}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg"
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Finalisation en cours..." : "Finaliser ma fiche d'évaluation"}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
