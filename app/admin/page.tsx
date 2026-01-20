"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KpiCards } from "@/components/admin/shared/kpi-cards"
import { LeadsToolbar } from "@/components/admin/leads/leads-toolbar"
import { LeadsKanban } from "@/components/admin/leads/leads-kanban"
import { LeadsTable } from "@/components/admin/leads/leads-table"
import { LeadDrawer } from "@/components/admin/leads/lead-drawer"
import { BrokersPanel } from "@/components/admin/clients/brokers-panel"
import { PasswordsPanel } from "@/components/admin/users/passwords-panel"
import { DisqualifyDialog } from "@/components/admin/modals/disqualify-dialog"
import { ResetPasswordDialog } from "@/components/admin/modals/reset-password-dialog"
import { DeleteUserDialog } from "@/components/admin/modals/delete-user-dialog"
import { EcmDialog } from "@/components/admin/modals/ecm-dialog"
import { Broker, Lead, User } from "@/types/admin"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState(false)

  const [leads, setLeads] = useState<Lead[]>([])
  const [brokers, setBrokers] = useState<Broker[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState<string | null>(null)
  const [assignToBroker, setAssignToBroker] = useState<string>("")

  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")

  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false)
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null)
  const [isDeletingUser, setIsDeletingUser] = useState(false)
  const [deleteUserError, setDeleteUserError] = useState("")

  const [newBroker, setNewBroker] = useState({
    email: "",
    fullName: "",
    companyName: "",
    phone: "",
    territory: "",
  })

  const [selectedLeadDetails, setSelectedLeadDetails] = useState<Lead | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const [showDisqualifyDialog, setShowDisqualifyDialog] = useState(false)
  const [selectedLeadForDisqualify, setSelectedLeadForDisqualify] = useState<Lead | null>(null)
  const [disqualifyTemplate, setDisqualifyTemplate] = useState("standard")
  const [disqualifyCustomMessage, setDisqualifyCustomMessage] = useState("")
  const [isSendingDisqualify, setIsSendingDisqualify] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState("")
  const [leadToken, setLeadToken] = useState<string | null>(null)

  const [showEcmDialog, setShowEcmDialog] = useState(false)
  const [selectedLeadForEcm, setSelectedLeadForEcm] = useState<Lead | null>(null)

  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [assignedFilter, setAssignedFilter] = useState("all")
  const [propertyTypeFilter, setPropertyTypeFilter] = useState("all")
  const [sort, setSort] = useState<"desc" | "asc">("desc")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
    }
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      const [leadsRes, brokersRes, usersRes] = await Promise.all([
        fetch("/api/admin/leads"),
        fetch("/api/admin/brokers"),
        fetch("/api/admin/users"),
      ])

      if (leadsRes.ok) {
        const leadsData = await leadsRes.json()
        setLeads(leadsData)
      }

      if (brokersRes.ok) {
        const brokersData = await brokersRes.json()
        setBrokers(brokersData)
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignLead = async (leadId: string, brokerId: string | null) => {
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brokerId }),
      })

      if (!res.ok) {
        const error = await res.json()
        console.error("Failed to assign lead:", error)
        return
      }

      fetchData()
      setSelectedLead(null)
      setAssignToBroker("")
    } catch (error) {
      console.error("Error assigning lead:", error)
    }
  }


  const handleCreateBroker = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/admin/brokers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newBroker.email,
          fullName: newBroker.fullName,
          companyName: newBroker.companyName || null,
          phone: newBroker.phone || null,
          territory: newBroker.territory || null,
        }),
      })

      if (res.ok) {
        setNewBroker({
          email: "",
          fullName: "",
          companyName: "",
          phone: "",
          territory: "",
        })
        fetchData()
      }
    } catch (error) {
      console.error("Error creating broker:", error)
    }
  }

  const handleDeleteBroker = async (brokerId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce courtier ?")) return

    try {
      const res = await fetch(`/api/admin/brokers/${brokerId}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Erreur lors de la suppression")
      fetchData() // refresh brokers list
    } catch (error) {
      console.error(error)
      alert("Impossible de supprimer ce courtier")
    }
  }

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || password === "VMR2026!Admin") {
      setIsAuthenticated(true)
      setAuthError(false)
      fetchData()
    } else {
      setAuthError(true)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")

    if (!selectedUser) return

    if (newPassword.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          newPassword: newPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setPasswordSuccess("Mot de passe réinitialisé avec succès!")
        setNewPassword("")
        setTimeout(() => {
          setShowPasswordModal(false)
          setSelectedUser(null)
          setPasswordSuccess("")
        }, 2000)
      } else {
        setPasswordError(data.error || "Erreur lors de la réinitialisation")
      }
    } catch (error) {
      console.error("Error resetting password:", error)
      setPasswordError("Erreur serveur")
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUserToDelete) return

    setIsDeletingUser(true)
    setDeleteUserError("")

    try {
      const res = await fetch(`/api/admin/users/${selectedUserToDelete.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur lors de la suppression")
      }

      setShowDeleteUserModal(false)
      setSelectedUserToDelete(null)
      fetchData() // refresh users list
    } catch (error: any) {
      console.error(error)
      setDeleteUserError(error.message)
    } finally {
      setIsDeletingUser(false)
    }
  }

  const handleViewDetails = async (leadId: string) => {
    setLoadingDetails(true)
    setShowDetailsModal(true)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`)
      if (res.ok) {
        const data = await res.json()
        setSelectedLeadDetails(data)
      }
    } catch (error) {
      console.error("Error fetching lead details:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleDisqualifyLead = async () => {
    if (!selectedLeadForDisqualify) return

    setIsSendingDisqualify(true)
    try {
      const response = await fetch("/api/admin/disqualify-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadEmail: selectedLeadForDisqualify.email,
          leadName: selectedLeadForDisqualify.full_name,
          customSubject: emailSubject,
          customBody: emailBody,
          templateType: disqualifyTemplate,
          leadToken: leadToken,
        }),
      })

      if (!response.ok) throw new Error("Failed to send email")

      alert("Email de disqualification envoyé avec succès!")
      setShowDisqualifyDialog(false)
      setSelectedLeadForDisqualify(null)
      setDisqualifyCustomMessage("")
      setDisqualifyTemplate("standard")
      fetchData()
    } catch (error) {
      console.error("Error disqualifying lead:", error)
      alert("Erreur lors de l'envoi de l'email")
    } finally {
      setIsSendingDisqualify(false)
    }
  }

  const handleOpenEcm = (lead: Lead) => {
    setSelectedLeadForEcm(lead)
    setShowEcmDialog(true)
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

  const generateEmailPreview = (templateType: string, customMessage: string, leadName: string) => {
    const templates = {
      reminder: {
        subject: "Valeur Maison Rapide - Accélérer le processus de votre demande d'évaluation...",
        body:
          customMessage ||
          `Complétez votre fiche d'évaluation immobilière pour obtenir une estimation plus précise et détaillée de votre propriété.\n\nN.B.: Les demandes avec fiche complétée sont traitées en priorité.\n\nNotre équipe vous contactera rapidement après réception.`,
      },
      standard: {
        subject: "Valeur Maison Rapide - Mise à jour de votre demande",
        body:
          customMessage ||
          `Après examen de votre demande, nous ne sommes malheureusement pas en mesure de vous accompagner pour le moment.`,
      },
      followup: {
        subject: "Valeur Maison Rapide - Restons en contact",
        body:
          customMessage ||
          `Bien que nous ne puissions pas vous accompagner immédiatement, votre projet nous intéresse. Nous vous invitons à nous recontacter dans quelques mois si votre situation évolue.`,
      },
      short: {
        subject: "Valeur Maison Rapide - Réponse à votre demande",
        body:
          customMessage ||
          `Nous avons bien reçu votre demande. Malheureusement, nous ne pouvons pas y donner suite pour le moment.`,
      },
      resources: {
        subject: "Valeur Maison Rapide - Ressources utiles",
        body:
          customMessage ||
          `Bien que nous ne puissions pas vous accompagner directement, nous vous invitons à consulter les ressources suivantes qui pourraient vous être utiles dans votre démarche.`,
      },
    }

    const template = templates[templateType as keyof typeof templates] || templates.standard
    return template
  }

  const fetchLeadToken = async (leadId: string) => {
    try {
      const response = await fetch(`/api/admin/lead-token/${leadId}`)
      const data = await response.json()
      return data.token
    } catch (error) {
      console.error("[v0] Error fetching lead token:", error)
      return null
    }
  }

  useEffect(() => {
    if (selectedLeadForDisqualify) {
      const preview = generateEmailPreview(
        disqualifyTemplate,
        disqualifyCustomMessage,
        selectedLeadForDisqualify.full_name,
      )
      setEmailSubject(preview.subject)
      setEmailBody(preview.body)
    }
  }, [disqualifyTemplate, disqualifyCustomMessage, selectedLeadForDisqualify])

  useEffect(() => {
    if (showDisqualifyDialog && selectedLeadForDisqualify) {
      const preview = generateEmailPreview(disqualifyTemplate, "", selectedLeadForDisqualify.full_name)
      setEmailSubject(preview.subject)
      setEmailBody(preview.body)
    }
  }, [showDisqualifyDialog, selectedLeadForDisqualify, disqualifyTemplate])
  // </CHANGE>

  const filteredLeads = useMemo(() => {
    let filtered = [...leads]

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (lead) =>
          lead.full_name?.toLowerCase().includes(searchLower) ||
          lead.email?.toLowerCase().includes(searchLower) ||
          lead.phone?.toLowerCase().includes(searchLower) ||
          lead.address?.toLowerCase().includes(searchLower) ||
          lead.city?.toLowerCase().includes(searchLower) ||
          lead.lead_number?.toLowerCase().includes(searchLower),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    // Assigned filter
    if (assignedFilter !== "all") {
      if (assignedFilter === "unassigned") {
        filtered = filtered.filter((lead) => !lead.assigned_to)
      } else {
        filtered = filtered.filter((lead) => lead.assigned_to === assignedFilter)
      }
    }

    // Property type filter
    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter((lead) => lead.property_type === propertyTypeFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sort === "desc" ? dateB - dateA : dateA - dateB
    })

    return filtered
  }, [leads, search, statusFilter, assignedFilter, propertyTypeFilter, sort])

  const statuses = useMemo(() => {
    const uniqueStatuses = Array.from(new Set(leads.map((l) => l.status || "unclassified")))
    return uniqueStatuses
  }, [leads])

  const propertyTypes = useMemo(() => {
    const uniqueTypes = Array.from(new Set(leads.map((l) => l.property_type).filter(Boolean)))
    return uniqueTypes
  }, [leads])

  const handleOpenLead = (lead: Lead) => {
    setDrawerLead(lead)
    setDrawerOpen(true)
  }

  const handleDisqualify = async (lead: Lead) => {
    setSelectedLeadForDisqualify(lead)
    setShowDisqualifyDialog(true)

    // Fetch the lead's token in the background
    const token = await fetchLeadToken(lead.id)
    setLeadToken(token)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
            <p className="text-gray-600 mt-2">Connectez-vous pour continuer</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="admin-password">Mot de passe</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setAuthError(false)
                }}
                placeholder="Entrez le mot de passe administrateur"
                className={authError ? "border-red-500" : ""}
              />
              {authError && <p className="text-sm text-red-600 mt-1">Mot de passe incorrect</p>}
            </div>
            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord de l'administrateur - Valeur Maison Rapide
            </h1>
            <p className="text-gray-600 mt-2">Gestion des leads et des clients</p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setIsAuthenticated(false)
              setPassword("")
            }}
          >
            Déconnexion
          </Button>
        </div>

        <KpiCards leads={leads} brokers={brokers} />

        <Tabs defaultValue="leads" className="mt-8">
          <TabsList>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="passwords">Mots de passe</TabsTrigger>
          </TabsList>

          <TabsContent value="leads" className="space-y-4">
            <LeadsToolbar
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              assignedFilter={assignedFilter}
              setAssignedFilter={setAssignedFilter}
              propertyTypeFilter={propertyTypeFilter}
              setPropertyTypeFilter={setPropertyTypeFilter}
              sort={sort}
              setSort={setSort}
              view={view}
              setView={setView}
              brokers={brokers}
              statuses={statuses}
              propertyTypes={propertyTypes}
            />

            {view === "kanban" ? (
              <LeadsKanban
                leads={filteredLeads}
                brokers={brokers}
                onOpenLead={handleOpenLead}
                getStatusColor={getStatusColor}
              />
            ) : (
              <LeadsTable
                leads={filteredLeads}
                brokers={brokers}
                onAssignClick={(leadId) => setSelectedLead(leadId)}
                onDisqualifyClick={handleDisqualify}
                onViewDetails={handleViewDetails}
                selectedLead={selectedLead}
                assignToBroker={assignToBroker}
                setAssignToBroker={setAssignToBroker}
                handleAssignLead={handleAssignLead}
                getStatusColor={getStatusColor}
              />
            )}
          </TabsContent>

          <TabsContent value="clients">
            <BrokersPanel
              brokers={brokers}
              users={users}
              leads={leads}
              newBroker={newBroker}
              setNewBroker={setNewBroker}
              handleCreateBroker={handleCreateBroker}
              handleDeleteBroker={handleDeleteBroker}
            />
          </TabsContent>

          <TabsContent value="passwords">
            <PasswordsPanel
              users={users}
              brokers={brokers}
              onOpenReset={(user) => {
                setSelectedUser(user)
                setShowPasswordModal(true)
                setNewPassword("")
                setPasswordError("")
                setPasswordSuccess("")
              }}
              onOpenDelete={(user) => {
                setSelectedUserToDelete(user)
                setShowDeleteUserModal(true)
                setDeleteUserError("")
              }}
            />
          </TabsContent>
        </Tabs>
      </div>

      <LeadDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        lead={drawerLead}
        brokers={brokers}
        onViewDetails={handleViewDetails}
        handleAssignLead={handleAssignLead}
        onDisqualify={handleDisqualify}
        onOpenEcm={handleOpenEcm}
        getStatusColor={getStatusColor}
      />

      <DisqualifyDialog
        open={showDisqualifyDialog}
        onOpenChange={setShowDisqualifyDialog}
        selectedLead={selectedLeadForDisqualify}
        leadToken={leadToken}
        template={disqualifyTemplate}
        setTemplate={setDisqualifyTemplate}
        customMessage={disqualifyCustomMessage}
        setCustomMessage={setDisqualifyCustomMessage}
        emailSubject={emailSubject}
        setEmailSubject={setEmailSubject}
        emailBody={emailBody}
        setEmailBody={setEmailBody}
        isSending={isSendingDisqualify}
        onSend={handleDisqualifyLead}
        generateEmailPreview={generateEmailPreview}
      />

      <ResetPasswordDialog
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        selectedUser={selectedUser}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        passwordError={passwordError}
        passwordSuccess={passwordSuccess}
        onSubmit={handleResetPassword}
        onCancel={() => {
          setShowPasswordModal(false)
          setSelectedUser(null)
          setNewPassword("")
          setPasswordError("")
          setPasswordSuccess("")
        }}
      />

      <DeleteUserDialog
        open={showDeleteUserModal}
        onOpenChange={setShowDeleteUserModal}
        user={selectedUserToDelete}
        onConfirm={handleDeleteUser}
        isDeleting={isDeletingUser}
        error={deleteUserError}
      />

      <EcmDialog open={showEcmDialog} onOpenChange={setShowEcmDialog} lead={selectedLeadForEcm} />
    </div>
  )
}
