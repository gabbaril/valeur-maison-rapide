"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getSupabaseBrowser } from "@/lib/supabase-client"
import { LeadsToolbar } from "@/components/admin/leads/leads-toolbar"
import { BrokerResetPasswordDialog } from "@/components/broker/reset-password-dialog"

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
}

interface BrokerProfile {
  full_name: string
  email: string
  company_name: string | null
  territory: string | null
}

interface User {
  email: string
}

export default function BrokerDashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [profile, setProfile] = useState<BrokerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all")
  const [sort, setSort] = useState<"desc" | "asc">("desc")
  const router = useRouter()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const supabase = getSupabaseBrowser()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/broker/login")
      return
    }

    await fetchData(user.id)
  }

  const fetchData = async (userId: string) => {
    try {
      const supabase = getSupabaseBrowser()

      const { data: brokerData } = await supabase.from("brokers").select("*").eq("id", userId).single()

      if (brokerData) {
        setProfile(brokerData)
      }

      const { data: leadsData } = await supabase
        .from("leads")
        .select("*")
        .eq("assigned_to", userId)
        .order("created_at", { ascending: false })

      if (leadsData) {
        setLeads(leadsData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const supabase = getSupabaseBrowser()

      await supabase.from("leads").update({ status: newStatus }).eq("id", leadId)

      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, status: newStatus } : lead)))
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleLogout = async () => {
    const supabase = getSupabaseBrowser()
    await supabase.auth.signOut()
    router.push("/broker/login")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unassigned":
        return "bg-blue-100 text-blue-800"
      case "assigned":
        return "bg-yellow-100 text-yellow-800"
      case "contacted":
        return "bg-purple-100 text-purple-800"
      case "converted":
        return "bg-green-100 text-green-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const filteredLeads = useMemo(() => {
    let filtered = [...leads]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.full_name.toLowerCase().includes(searchLower) ||
          lead.email.toLowerCase().includes(searchLower) ||
          lead.phone.toLowerCase().includes(searchLower) ||
          lead.address.toLowerCase().includes(searchLower) ||
          lead.city?.toLowerCase().includes(searchLower) ||
          lead.lead_number.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    // Property type filter
    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter((lead) => lead.property_type === propertyTypeFilter)
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sort === "desc" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [leads, search, statusFilter, propertyTypeFilter, sort])

  const statuses = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.status || "unclassified")))
  }, [leads])

  const propertyTypes = useMemo(() => {
    return Array.from(new Set(leads.map((l) => l.property_type).filter(Boolean)))
  }, [leads])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue dans votre portail client</h1>
            {profile && (
              <p className="text-sm text-gray-600 mt-1">
                {profile.full_name}
                {profile.company_name && ` • ${profile.company_name}`}
              </p>
            )}
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPasswordModal(true)}
              className="mr-2"
            >
              Changer le mot de passe
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl p-6">
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Total Leads</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{leads.length}</div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Nouveaux</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">
              {leads.filter((l) => l.status === "unassigned" || l.status === "assigned").length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">En cours</div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              {leads.filter((l) => l.status === "contacted").length}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-medium text-gray-600">Convertis</div>
            <div className="text-3xl font-bold text-green-600 mt-2">
              {leads.filter((l) => l.status === "converted").length}
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mes Leads</h2>

          <LeadsToolbar
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            propertyTypeFilter={propertyTypeFilter}
            setPropertyTypeFilter={setPropertyTypeFilter}
            sort={sort}
            setSort={setSort}
            view="table"
            setView={() => {}}
            brokers={[]} // no broker filter needed
            statuses={statuses}
            propertyTypes={propertyTypes}
          />


          {filteredLeads.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Aucun lead trouvé</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Adresse</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-mono text-xs">{lead.lead_number}</TableCell>
                      <TableCell className="text-sm text-gray-600">{formatDate(lead.created_at)}</TableCell>
                      <TableCell className="font-medium">{lead.full_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <a href={`mailto:${lead.email}`} className="text-blue-600 hover:underline">
                            {lead.email}
                          </a>
                          <div className="text-gray-500">
                            <a href={`tel:${lead.phone}`} className="hover:underline">
                              {lead.phone}
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{lead.address}</div>
                        {(lead.city || lead.postal_code) && (
                          <div className="text-gray-500 text-xs">
                            {lead.city && lead.postal_code
                              ? `${lead.city}, ${lead.postal_code}`
                              : lead.city || lead.postal_code}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{lead.property_type}</TableCell>
                      <TableCell>
                      <Select
                        value={lead.status}
                        onValueChange={(value) => handleStatusChange(lead.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue>
                            <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assigned">assigned</SelectItem>
                          <SelectItem value="contacted">contacted</SelectItem>
                          <SelectItem value="converted">converted</SelectItem>
                          <SelectItem value="closed">closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/broker/leads/${lead.id}`)}
                          className="text-xs"
                        >
                          Voir détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      
      </div>

      <BrokerResetPasswordDialog
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
      />

    </div>
  )
}
