"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface IncomePropertyFormData {
  // Étape 1 - Informations sur l'immeuble
  units_count: string
  occupation_type: string
  rent_unit_1: string
  rent_unit_2: string
  rent_unit_3: string
  rent_unit_4: string
  gross_monthly_revenue: string
  rented_units_count: string
  rent_includes_heating: boolean
  rent_includes_electricity: boolean
  rent_includes_internet: boolean
  rent_includes_other: boolean
  rent_includes_other_details: string
  has_active_leases: string
  lease_renewal_date: string
  parking_info: string
  basement_info: string
  recent_renovations: string
  renovations_details: string

  // Étape 2 - Objectif et contexte
  evaluation_reason: string
  sale_planned: string
  sale_horizon: string
  owner_estimated_value: string
  municipal_taxes: string
  school_taxes: string
  insurance: string
  snow_maintenance: string
  utilities_if_owner_paid: string
  important_notes: string

  // FILTRAGE VENDEUR (CRM)
  open_to_broker: string
}

interface IncomePropertyEvaluationFormProps {
  lead: any
  token: string
  onSuccess: () => void
  onError: (error: string) => void
}

export default function IncomePropertyEvaluationForm({
  lead,
  token,
  onSuccess,
  onError,
}: IncomePropertyEvaluationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [submitting, setSubmitting] = useState(false)

  // Determine if 5+ units based on property_type
  const is5PlusUnits = lead?.property_type === "immeuble-revenus-5-et-plus" || 
    lead?.property_type === "Immeubles à revenus (5 logements et +)"

  const [formData, setFormData] = useState<IncomePropertyFormData>({
    units_count: "",
    occupation_type: "",
    rent_unit_1: "",
    rent_unit_2: "",
    rent_unit_3: "",
    rent_unit_4: "",
    gross_monthly_revenue: "",
    rented_units_count: "",
    rent_includes_heating: false,
    rent_includes_electricity: false,
    rent_includes_internet: false,
    rent_includes_other: false,
    rent_includes_other_details: "",
    has_active_leases: "",
    lease_renewal_date: "",
    parking_info: "",
    basement_info: "",
    recent_renovations: "",
    renovations_details: "",
    evaluation_reason: "",
    sale_planned: "",
    sale_horizon: "",
    owner_estimated_value: "",
    municipal_taxes: "",
    school_taxes: "",
    insurance: "",
    snow_maintenance: "",
    utilities_if_owner_paid: "",
    important_notes: "",
    open_to_broker: "",
  })

  const handleChange = (field: keyof IncomePropertyFormData, value: string | boolean) => {
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
          form_type: "income_property",
          income_property_data: formData,
        }),
      })

      const data = await res.json()

      if (data.ok) {
        onSuccess()
      } else {
        onError(data.error || "Erreur lors de la finalisation")
      }
    } catch (err) {
      onError("Erreur réseau")
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

  // Get the number of units for rendering rent fields
  const unitsCount = parseInt(formData.units_count) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 md:p-8">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Finaliser votre fiche d'évaluation - Immeuble à revenus
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
                  Informations sur l'immeuble
                </h2>

                <div className="space-y-6">
                  {/* Nombre de logements */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nombre de logements *
                    </label>
                    {is5PlusUnits ? (
                      <input
                        type="number"
                        value={formData.units_count}
                        onChange={(e) => handleChange("units_count", e.target.value)}
                        placeholder="Ex: 6, 8, 12..."
                        min="5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    ) : (
                      <select
                        value={formData.units_count}
                        onChange={(e) => handleChange("units_count", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="2">2 logements</option>
                        <option value="3">3 logements</option>
                        <option value="4">4 logements</option>
                      </select>
                    )}
                  </div>

                  {/* Type d'occupation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Type d'occupation *
                    </label>
                    <select
                      value={formData.occupation_type}
                      onChange={(e) => handleChange("occupation_type", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="proprietaire-occupant">Propriétaire occupant</option>
                      <option value="100-loue">100% loué</option>
                      <option value="partiellement-loue">Partiellement loué</option>
                    </select>
                  </div>

                  {/* Revenus locatifs */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Revenus locatifs</h3>
                    
                    {is5PlusUnits ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Revenu brut mensuel total
                          </label>
                          <input
                            type="text"
                            value={formData.gross_monthly_revenue}
                            onChange={(e) => handleChange("gross_monthly_revenue", e.target.value)}
                            placeholder="Ex: 8 500 $"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre d'unités louées
                          </label>
                          <input
                            type="number"
                            value={formData.rented_units_count}
                            onChange={(e) => handleChange("rented_units_count", e.target.value)}
                            placeholder="Ex: 5"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unitsCount >= 1 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loyer logement #1</label>
                            <input
                              type="text"
                              value={formData.rent_unit_1}
                              onChange={(e) => handleChange("rent_unit_1", e.target.value)}
                              placeholder="Ex: 950 $"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                        )}
                        {unitsCount >= 2 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loyer logement #2</label>
                            <input
                              type="text"
                              value={formData.rent_unit_2}
                              onChange={(e) => handleChange("rent_unit_2", e.target.value)}
                              placeholder="Ex: 1 050 $"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                        )}
                        {unitsCount >= 3 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loyer logement #3</label>
                            <input
                              type="text"
                              value={formData.rent_unit_3}
                              onChange={(e) => handleChange("rent_unit_3", e.target.value)}
                              placeholder="Ex: 1 100 $"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                        )}
                        {unitsCount >= 4 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Loyer logement #4</label>
                            <input
                              type="text"
                              value={formData.rent_unit_4}
                              onChange={(e) => handleChange("rent_unit_4", e.target.value)}
                              placeholder="Ex: 1 200 $"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                            />
                          </div>
                        )}
                        {unitsCount === 0 && (
                          <p className="text-sm text-gray-500 col-span-2">
                            Veuillez d'abord sélectionner le nombre de logements ci-dessus.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inclus dans les loyers */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                      Inclus dans les loyers
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rent_includes_heating}
                          onChange={(e) => handleChange("rent_includes_heating", e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                        />
                        <span className="text-sm text-gray-700">Chauffage</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rent_includes_electricity}
                          onChange={(e) => handleChange("rent_includes_electricity", e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                        />
                        <span className="text-sm text-gray-700">Électricité</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rent_includes_internet}
                          onChange={(e) => handleChange("rent_includes_internet", e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                        />
                        <span className="text-sm text-gray-700">Internet</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.rent_includes_other}
                          onChange={(e) => handleChange("rent_includes_other", e.target.checked)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-600"
                        />
                        <span className="text-sm text-gray-700">Autres</span>
                      </label>
                    </div>
                    {formData.rent_includes_other && (
                      <div className="mt-3 pl-4 border-l-2 border-red-600">
                        <input
                          type="text"
                          value={formData.rent_includes_other_details}
                          onChange={(e) => handleChange("rent_includes_other_details", e.target.value)}
                          placeholder="Précisez..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Baux en vigueur */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Baux en vigueur ?
                    </label>
                    <select
                      value={formData.has_active_leases}
                      onChange={(e) => handleChange("has_active_leases", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                    </select>
                    {formData.has_active_leases === "oui" && (
                      <div className="mt-3 pl-4 border-l-2 border-red-600">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dates de renouvellement (mois/année)
                        </label>
                        <input
                          type="text"
                          value={formData.lease_renewal_date}
                          onChange={(e) => handleChange("lease_renewal_date", e.target.value)}
                          placeholder="Ex: Juillet 2025, Juillet 2026..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  {/* Stationnement / garage */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Stationnement / Garage
                    </label>
                    <select
                      value={formData.parking_info}
                      onChange={(e) => handleChange("parking_info", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="garage-attache">Garage attaché</option>
                      <option value="garage-detache">Garage détaché</option>
                      <option value="stationnement-exterieur">Stationnement extérieur</option>
                      <option value="stationnement-interieur">Stationnement intérieur</option>
                      <option value="aucun">Aucun</option>
                    </select>
                  </div>

                  {/* Sous-sol */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Sous-sol
                    </label>
                    <select
                      value={formData.basement_info}
                      onChange={(e) => handleChange("basement_info", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="sous-sol-complet">Sous-sol complet</option>
                      <option value="sous-sol-partiel">Sous-sol partiel</option>
                      <option value="vide-sanitaire">Vide sanitaire</option>
                      <option value="aucun">Aucun</option>
                      <option value="ne-sais-pas">Je ne sais pas</option>
                    </select>
                  </div>

                  {/* Rénovations majeures */}
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
                      <option value="oui">Oui</option>
                      <option value="non">Non</option>
                      <option value="ne-sais-pas">Je ne sais pas</option>
                    </select>

                    {formData.recent_renovations === "oui" && (
                      <div className="pl-4 border-l-2 border-red-600">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Détails des rénovations</label>
                        <textarea
                          value={formData.renovations_details}
                          onChange={(e) => handleChange("renovations_details", e.target.value)}
                          rows={2}
                          placeholder="Ex: Toiture remplacée en 2022, fenêtres changées..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                        />
                      </div>
                    )}
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
                    Objectif et contexte
                  </h2>

                  <div className="space-y-6">
                    {/* Raison de l'évaluation */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Pour quelle raison souhaitez-vous obtenir une évaluation ?
                      </label>
                      <textarea
                        value={formData.evaluation_reason}
                        onChange={(e) => handleChange("evaluation_reason", e.target.value)}
                        rows={3}
                        placeholder="Ex : Obtenir la valeur, planification de vente, refinancement, succession…"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>

                    {/* Vente envisagée */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Envisagez-vous de potentiellement vendre l'immeuble ?
                      </label>
                      <select
                        value={formData.sale_planned}
                        onChange={(e) => handleChange("sale_planned", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="oui-certainement">Oui, certainement</option>
                        <option value="possiblement">Possiblement</option>
                        <option value="non-curiosite">Non, simple curiosité</option>
                        <option value="ne-sais-pas">Je ne sais pas encore</option>
                      </select>
                    </div>

                    {/* Horizon de vente */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Horizon de vente
                      </label>
                      <select
                        value={formData.sale_horizon}
                        onChange={(e) => handleChange("sale_horizon", e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      >
                        <option value="">Sélectionner...</option>
                        <option value="3-mois">Dans les 3 prochains mois</option>
                        <option value="6-mois-1-an">D'ici 6 mois à 1 an</option>
                        <option value="plus-1-an">Dans plus d'un an</option>
                        <option value="selon-opportunites">Selon les opportunités</option>
                      </select>
                    </div>

                    {/* Valeur estimée par le propriétaire */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Selon-vous quelle est la valeur estimée de l'immeuble ?
                      </label>
                      <input
                        type="text"
                        value={formData.owner_estimated_value}
                        onChange={(e) => handleChange("owner_estimated_value", e.target.value)}
                        placeholder="Ex : 650 000 $"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>

                    {/* Dépenses annuelles */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Dépenses annuelles (OPTIONNEL)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Taxes municipales</label>
                          <input
                            type="text"
                            value={formData.municipal_taxes}
                            onChange={(e) => handleChange("municipal_taxes", e.target.value)}
                            placeholder="Ex: 4 500 $"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Taxes scolaires</label>
                          <input
                            type="text"
                            value={formData.school_taxes}
                            onChange={(e) => handleChange("school_taxes", e.target.value)}
                            placeholder="Ex: 800 $"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assurances</label>
                          <input
                            type="text"
                            value={formData.insurance}
                            onChange={(e) => handleChange("insurance", e.target.value)}
                            placeholder="Ex: 2 400 $"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Déneigement/entretien (optionnel)
                          </label>
                          <input
                            type="text"
                            value={formData.snow_maintenance}
                            onChange={(e) => handleChange("snow_maintenance", e.target.value)}
                            placeholder="Ex: 1 200 $"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Électricité/chauffage (si payé par propriétaire)
                          </label>
                          <input
                            type="text"
                            value={formData.utilities_if_owner_paid}
                            onChange={(e) => handleChange("utilities_if_owner_paid", e.target.value)}
                            placeholder="Ex: 3 600 $"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes importantes */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Notes importantes (facultatif)
                      </label>
                      <textarea
                        value={formData.important_notes}
                        onChange={(e) => handleChange("important_notes", e.target.value)}
                        rows={3}
                        placeholder="Informations supplémentaires pertinentes..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* FILTRAGE VENDEUR (CRM) */}
              <div className="border-t-4 border-red-600 bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold text-white bg-red-600 -mx-6 -mt-6 px-6 py-3 mb-6 rounded-t-lg">
                  Suite possible à votre demande
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Ces questions nous permettent de déterminer si un accompagnement professionnel pourrait être pertinent dans votre situation. Vous pouvez y répondre librement, sans obligation.
                </p>

                <div className="space-y-6">
                  {/* Ouverture à travailler avec un courtier */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Si un accompagnement professionnel s'avérait pertinent, seriez-vous ouvert(e) à échanger avec un courtier immobilier ?
                    </label>
                    <select
                      required
                      value={formData.open_to_broker}
                      onChange={(e) => handleChange("open_to_broker", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent"
                    >
                      <option value="">Sélectionner...</option>
                      <option value="Oui">Oui</option>
                      <option value="Peut-être">Peut-être</option>
                      <option value="Non">Non</option>
                    </select>
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
