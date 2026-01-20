"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin } from "lucide-react"

interface Broker {
  id: string
  full_name: string
}

interface Lead {
  id: string
  lead_number: string
  full_name: string
  email: string
  phone: string
  address: string
  city: string | null
  property_type: string
  status: string
  assigned_to: string | null
  created_at: string
}

interface LeadsKanbanProps {
  leads: Lead[]
  brokers: Broker[]
  onOpenLead: (lead: Lead) => void
  getStatusColor: (status: string) => string
}

export function LeadsKanban({ leads, brokers, onOpenLead, getStatusColor }: LeadsKanbanProps) {
  const columns = [
    { id: "unassigned", title: "Non assigné", status: "unassigned" },
    { id: "assigned", title: "Assigné", status: "assigned" },
    { id: "contacted", title: "Contacté", status: "contacted" },
    { id: "converted", title: "Converti", status: "converted" },
    { id: "closed", title: "Fermé", status: "closed" },
  ]

  const getLeadsByStatus = (status: string) => {
    return leads.filter((lead) => lead.status === status || (!lead.status && status === "unassigned"))
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {columns.map((column) => {
        const columnLeads = getLeadsByStatus(column.status)
        return (
          <div key={column.id} className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{column.title}</h3>
              <Badge variant="secondary">{columnLeads.length}</Badge>
            </div>
            <div className="space-y-3 flex-1">
              {columnLeads.map((lead) => (
                <Card
                  key={lead.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onOpenLead(lead)}
                >
                  <div className="space-y-2">
                    <div className="font-semibold text-sm">{lead.full_name}</div>
                    <div className="text-xs text-gray-500 font-mono">{lead.lead_number}</div>
                    <Badge className={getStatusColor(lead.status)} variant="outline">
                      {lead.property_type}
                    </Badge>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{lead.city || lead.address}</span>
                      </div>
                    </div>
                    {lead.assigned_to && (
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        Assigné: {brokers.find((b) => b.id === lead.assigned_to)?.full_name || "N/A"}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
