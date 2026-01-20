"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Broker, Lead, User } from "@/types/admin"

interface BrokersPanelProps {
  brokers: Broker[]
  users: User[]
  leads: Lead[]
  newBroker: {
    email: string
    fullName: string
    companyName: string
    phone: string
    territory: string
  }
  setNewBroker: (broker: any) => void
  handleCreateBroker: (e: React.FormEvent) => void
  handleDeleteBroker: (brokerId: string) => void
}

export function BrokersPanel({
  brokers,
  users,
  leads,
  newBroker,
  setNewBroker,
  handleCreateBroker,
  handleDeleteBroker
}: BrokersPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ajout d'un client</h2>
        <form onSubmit={handleCreateBroker} className="space-y-4">
          <div>
            <Label htmlFor="email">Adresse courriel *</Label>
            <Input
              id="email"
              type="email"
              required
              value={newBroker.email}
              onChange={(e) => setNewBroker({ ...newBroker, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="fullName">Nom Complet *</Label>
            <Input
              id="fullName"
              required
              value={newBroker.fullName}
              onChange={(e) => setNewBroker({ ...newBroker, fullName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="companyName">Compagnie</Label>
            <Input
              id="companyName"
              value={newBroker.companyName}
              onChange={(e) => setNewBroker({ ...newBroker, companyName: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input
              id="phone"
              value={newBroker.phone}
              onChange={(e) => setNewBroker({ ...newBroker, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="territory">Territoire</Label>
            <Input
              id="territory"
              placeholder="Ex: Trois-Rivières"
              value={newBroker.territory}
              onChange={(e) => setNewBroker({ ...newBroker, territory: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">
            Créer le Courtier
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Clients ({brokers.length})</h2>
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {brokers.map((broker) => {
            const hasUser = users.some((u) => u.email === broker.email)
            const hasLeads = leads.some((l) => l.assigned_to === broker.id)

            return (
              <div key={broker.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">{broker.full_name}</div>
                    <div className="text-sm text-gray-600">{broker.email}</div>
                    {broker.company_name && <div className="text-sm text-gray-500">{broker.company_name}</div>}
                    {broker.territory && (
                      <Badge variant="outline" className="mt-2">
                        {broker.territory}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant={broker.is_active ? "default" : "secondary"}>
                      {broker.is_active ? "Actif" : "Inactif"}
                    </Badge>

                    {/* Only show delete button if broker has no user and no leads */}
                    {!hasUser && !hasLeads && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteBroker(broker.id)}
                      >
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
