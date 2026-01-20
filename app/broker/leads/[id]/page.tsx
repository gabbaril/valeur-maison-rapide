"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowser } from "@/lib/supabase-client"

interface Lead {
  id: string
  lead_number: string
  full_name: string
  email: string
  phone: string
  address: string
  city: string | null
  postal_code: string | null
  property_type: string
  status: string
  created_at: string
  is_finalized: boolean
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer: string | null
  contact_weekday: string | null
  contact_weekend: string | null
  contact_notes: string | null
  property_usage: string | null
  owners_count: string | null
  is_occupied: string | null
  contact_person: string | null
  construction_year: string | null
  floors_count: string | null
  basement_info: string | null
  bedrooms_count: string | null
  bathrooms_count: string | null
  powder_rooms_count: string | null
  approximate_area: string | null
  recent_renovations: string | null
  renovations_details: string | null
  garage: string | null
  property_highlights: string | null
  sale_reason: string | null
  potential_sale_desire: string | null
  property_to_sell_type: string | null
  sector: string | null
  ideal_sale_deadline: string | null
  approximate_market_value: string | null
  need_buying_help: string | null
  buying_sector: string | null
  buying_budget: string | null
}

interface Note {
  id: string
  note: string
  created_at: string
}

export default function BrokerLeadDetailPage() {
  const [lead, setLead] = useState<Lead | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const leadId = params.id as string

  useEffect(() => {
    checkAuthAndFetch()
  }, [leadId])

  const checkAuthAndFetch = async () => {
    const supabase = getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/broker/login")
      return
    }

    await fetchLeadData()
  }

  const fetchLeadData = async () => {
    try {
      const supabase = getSupabaseBrowser()

      const { data: leadData, error: leadError } = await supabase.from("leads").select("*").eq("id", leadId).single()

      if (leadError) throw leadError
      setLead(leadData)

      const { data: notesData, error: notesError } = await supabase
        .from("lead_notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })

      if (notesError) throw notesError
      setNotes(notesData || [])
    } catch (error) {
      console.error("Error fetching lead:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Lead introuvable</h2>
          <Button onClick={() => router.push("/broker/dashboard")} className="mt-4">
            Retour au tableau de bord
          </Button>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      new: { label: "Nouveau", className: "bg-blue-100 text-blue-800" },
      assigned: { label: "Assigné", className: "bg-yellow-100 text-yellow-800" },
      contacted: { label: "Contacté", className: "bg-purple-100 text-purple-800" },
      converted: { label: "Converti", className: "bg-green-100 text-green-800" },
      closed: { label: "Fermé", className: "bg-gray-100 text-gray-800" },
    }
    return statusMap[status] || { label: status, className: "bg-gray-100 text-gray-800" }
  }

  const statusInfo = getStatusBadge(lead.status)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push("/broker/dashboard")}>
            ← Retour au tableau de bord
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Lead Info */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-sm text-gray-500">Lead #{lead.lead_number}</span>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{lead.full_name}</h1>
              </div>
              <div className="flex gap-2">
                <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
                {lead.is_finalized && <Badge className="bg-green-100 text-green-800">Finalisé</Badge>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-900">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                      {lead.email}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-900">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <a href={`tel:${lead.phone}`} className="hover:underline">
                      {lead.phone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Propriété</h3>
                <div className="space-y-2">
                  <div className="flex items-start text-gray-900">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-400 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <div>{lead.address}</div>
                      {(lead.city || lead.postal_code) && (
                        <div className="text-gray-500 text-sm">
                          {lead.city && lead.postal_code
                            ? `${lead.city}, ${lead.postal_code}`
                            : lead.city || lead.postal_code}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center text-gray-900">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    {lead.property_type}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
              Créé le{" "}
              {new Date(lead.created_at).toLocaleDateString("fr-FR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </Card>

          {(lead.sale_reason ||
            lead.potential_sale_desire ||
            lead.property_to_sell_type ||
            lead.sector ||
            lead.ideal_sale_deadline ||
            lead.approximate_market_value ||
            lead.need_buying_help) && (
            <Card className="p-6 border-t-4 border-red-600">
              <h2 className="text-xl font-bold text-gray-900 mb-4 bg-red-600 text-white -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
                PROJET DE VENTE
              </h2>
              <div className="space-y-4 text-sm">
                {lead.sale_reason && (
                  <div>
                    <span className="font-semibold text-gray-700">Raison de la vente:</span>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{lead.sale_reason}</p>
                  </div>
                )}
                {lead.potential_sale_desire && (
                  <div>
                    <span className="font-semibold text-gray-700">Potentiel d'envie de vendre:</span>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{lead.potential_sale_desire}</p>
                  </div>
                )}
                {lead.property_to_sell_type && (
                  <div>
                    <span className="font-semibold text-gray-700">Type de propriété à vendre:</span>
                    <p className="text-gray-900 mt-1">{lead.property_to_sell_type}</p>
                  </div>
                )}
                {lead.sector && (
                  <div>
                    <span className="font-semibold text-gray-700">Secteur:</span>
                    <p className="text-gray-900 mt-1">{lead.sector}</p>
                  </div>
                )}
                {lead.ideal_sale_deadline && (
                  <div>
                    <span className="font-semibold text-gray-700">Délai idéal pour vendre:</span>
                    <p className="text-gray-900 mt-1">{lead.ideal_sale_deadline}</p>
                  </div>
                )}
                {lead.approximate_market_value && (
                  <div>
                    <span className="font-semibold text-gray-700">Valeur marchande approximative:</span>
                    <p className="text-gray-900 mt-1">{lead.approximate_market_value}</p>
                  </div>
                )}
                {lead.need_buying_help && (
                  <div className="pt-4 border-t">
                    <span className="font-semibold text-gray-700">Besoin d'aide pour acheter?</span>
                    <p className="text-gray-900 mt-1">{lead.need_buying_help}</p>
                    {(lead.need_buying_help === "Oui" || lead.need_buying_help === "Peut-être") && (
                      <div className="ml-4 mt-2 pl-4 border-l-2 border-red-600 space-y-2">
                        {lead.buying_sector && (
                          <div>
                            <span className="font-medium text-gray-600">Secteur:</span>
                            <span className="ml-2 text-gray-900">{lead.buying_sector}</span>
                          </div>
                        )}
                        {lead.buying_budget && (
                          <div>
                            <span className="font-medium text-gray-600">Budget:</span>
                            <span className="ml-2 text-gray-900">{lead.buying_budget}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          {(lead.property_usage ||
            lead.owners_count ||
            lead.is_occupied ||
            lead.contact_person ||
            lead.construction_year ||
            lead.floors_count ||
            lead.basement_info ||
            lead.bedrooms_count ||
            lead.bathrooms_count ||
            lead.powder_rooms_count ||
            lead.approximate_area ||
            lead.recent_renovations ||
            lead.garage ||
            lead.property_highlights) && (
            <Card className="p-6 border-t-4 border-red-600">
              <h2 className="text-xl font-bold text-gray-900 mb-4 bg-red-600 text-white -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
                INFORMATION SUR LA MAISON
              </h2>
              <div className="space-y-4 text-sm">
                {lead.property_usage && (
                  <div>
                    <span className="font-semibold text-gray-700">Utilisation:</span>
                    <p className="text-gray-900 mt-1">{lead.property_usage}</p>
                  </div>
                )}
                {(lead.owners_count || lead.is_occupied || lead.contact_person) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Info propriétaires</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {lead.owners_count && (
                        <div>
                          <span className="font-medium text-gray-600">Nombre:</span>
                          <p className="text-gray-900">{lead.owners_count}</p>
                        </div>
                      )}
                      {lead.is_occupied && (
                        <div>
                          <span className="font-medium text-gray-600">Statut d'occupation:</span>
                          <p className="text-gray-900">{lead.is_occupied}</p>
                        </div>
                      )}
                      {lead.contact_person && (
                        <div>
                          <span className="font-medium text-gray-600">Personne à contacter:</span>
                          <p className="text-gray-900">{lead.contact_person}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {lead.construction_year && (
                  <div>
                    <span className="font-semibold text-gray-700">Année de construction:</span>
                    <p className="text-gray-900 mt-1">{lead.construction_year}</p>
                  </div>
                )}
                {lead.floors_count && (
                  <div>
                    <span className="font-semibold text-gray-700">Nombre d'étages:</span>
                    <p className="text-gray-900 mt-1">{lead.floors_count}</p>
                  </div>
                )}
                {lead.basement_info && (
                  <div>
                    <span className="font-semibold text-gray-700">Info sur le sous-sol:</span>
                    <p className="text-gray-900 mt-1">{lead.basement_info}</p>
                  </div>
                )}
                {(lead.bedrooms_count || lead.bathrooms_count || lead.powder_rooms_count) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">Pièces</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {lead.bedrooms_count && (
                        <div>
                          <span className="font-medium text-gray-600">Chambres:</span>
                          <p className="text-gray-900">{lead.bedrooms_count}</p>
                        </div>
                      )}
                      {lead.bathrooms_count && (
                        <div>
                          <span className="font-medium text-gray-600">Salles de bain complètes:</span>
                          <p className="text-gray-900">{lead.bathrooms_count}</p>
                        </div>
                      )}
                      {lead.powder_rooms_count && (
                        <div>
                          <span className="font-medium text-gray-600">Salles d'eau/de toilette:</span>
                          <p className="text-gray-900">{lead.powder_rooms_count}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {lead.approximate_area && (
                  <div>
                    <span className="font-semibold text-gray-700">Superficie approx:</span>
                    <p className="text-gray-900 mt-1">{lead.approximate_area}</p>
                  </div>
                )}
                {lead.recent_renovations && (
                  <div>
                    <span className="font-semibold text-gray-700">Rénovations récentes:</span>
                    <p className="text-gray-900 mt-1">{lead.recent_renovations}</p>
                    {lead.recent_renovations === "Oui" && lead.renovations_details && (
                      <div className="ml-4 mt-2 pl-4 border-l-2 border-red-600">
                        <span className="font-medium text-gray-600">Précisions:</span>
                        <p className="text-gray-900 mt-1 whitespace-pre-wrap">{lead.renovations_details}</p>
                      </div>
                    )}
                  </div>
                )}
                {lead.garage && (
                  <div>
                    <span className="font-semibold text-gray-700">Garage:</span>
                    <p className="text-gray-900 mt-1">{lead.garage}</p>
                  </div>
                )}
                {lead.property_highlights && (
                  <div>
                    <span className="font-semibold text-gray-700">Atouts de la maison:</span>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{lead.property_highlights}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {(lead.contact_weekday || lead.contact_weekend || lead.contact_notes) && (
            <Card className="p-6 border-t-4 border-red-600">
              <h2 className="text-xl font-bold text-gray-900 mb-4 bg-red-600 text-white -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
                MOMENT IDÉAL DE CONTACT
              </h2>
              <div className="space-y-4 text-sm">
                {lead.contact_weekday && (
                  <div>
                    <span className="font-semibold text-gray-700">Semaine:</span>
                    <p className="text-gray-900 mt-1">{lead.contact_weekday}</p>
                  </div>
                )}
                {lead.contact_weekend && (
                  <div>
                    <span className="font-semibold text-gray-700">Week-end:</span>
                    <p className="text-gray-900 mt-1">{lead.contact_weekend}</p>
                  </div>
                )}
                {lead.contact_notes && (
                  <div>
                    <span className="font-semibold text-gray-700">Notes:</span>
                    <p className="text-red-600 mt-1 italic whitespace-pre-wrap">{lead.contact_notes}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
