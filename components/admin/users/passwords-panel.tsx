"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, UserPlus } from "lucide-react"

interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
  role: string
}

interface Broker {
  id: string
  email: string
  full_name: string
  is_active: boolean
  created_at: string
}

interface PasswordsPanelProps {
  users: User[]
  brokers: Broker[]
  onOpenReset: (user: User) => void
  onOpenDelete: (user: User) => void
}

export function PasswordsPanel({ users, brokers, onOpenReset, onOpenDelete }: PasswordsPanelProps) {
  const [showCreateAuthDialog, setShowCreateAuthDialog] = useState(false)
  const [selectedBroker, setSelectedBroker] = useState<Broker | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const userEmails = users.map((u) => u.email.toLowerCase())
  const brokersWithoutAuth = brokers.filter(
    (broker) => broker.email && !userEmails.includes(broker.email.toLowerCase()),
  )

  const handleOpenCreateAuth = (broker: Broker) => {
    setSelectedBroker(broker)
    setNewPassword("")
    setError("")
    setSuccess("")
    setShowCreateAuthDialog(true)
  }

  const handleCreateAuthAccount = async () => {
    if (!selectedBroker || !newPassword) return

    if (newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setIsCreating(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/admin/brokers/create-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedBroker.email,
          password: newPassword,
          fullName: selectedBroker.full_name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erreur lors de la création du compte")
        return
      }

      setSuccess("Compte créé avec succès! Rechargez la page pour voir le changement.")
      setTimeout(() => {
        setShowCreateAuthDialog(false)
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Erreur inattendue")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Gestion des mots de passe</h2>
        <p className="text-sm text-gray-600 mb-4">Réinitialisez les mots de passe des utilisateurs</p>

        {brokersWithoutAuth.length > 0 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800">
                Courtiers sans compte de connexion ({brokersWithoutAuth.length})
              </h3>
            </div>
            <p className="text-sm text-amber-700 mb-3">
              Ces courtiers existent dans le système mais n'ont pas encore de compte pour se connecter.
            </p>
            <div className="space-y-2">
              {brokersWithoutAuth.map((broker) => (
                <div
                  key={broker.id}
                  className="flex items-center justify-between bg-white p-3 rounded border border-amber-200"
                >
                  <div>
                    <p className="font-medium text-gray-900">{broker.full_name}</p>
                    <p className="text-sm text-gray-600">{broker.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleOpenCreateAuth(broker)}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Créer un compte
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString("fr-CA")}</TableCell>
                  <TableCell className="text-sm">
                    {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("fr-CA") : "Jamais"}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenReset(user)}
                    >
                      Réinitialiser
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onOpenDelete(user)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={showCreateAuthDialog} onOpenChange={setShowCreateAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un compte de connexion</DialogTitle>
            <DialogDescription>
              Créez un compte pour que {selectedBroker?.full_name} puisse se connecter au tableau de bord courtier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={selectedBroker?.email || ""} disabled className="mt-1 bg-gray-100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Mot de passe initial</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 caractères"
                className="mt-1"
              />
            </div>

            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAuthDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreateAuthAccount} disabled={isCreating || !newPassword}>
              {isCreating ? "Création..." : "Créer le compte"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
