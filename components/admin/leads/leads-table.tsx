"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface Broker {
  id: string
  full_name: string
  is_active: boolean
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

interface LeadsTableProps {
  leads: Lead[]
  brokers: Broker[]
  onAssignClick: (leadId: string) => void
  onDisqualifyClick: (lead: Lead) => void
  onViewDetails: (leadId: string) => void
  selectedLead: string | null
  assignToBroker: string
  setAssignToBroker: (value: string) => void
  handleAssignLead: (leadId: string, brokerId: string | null) => void
  getStatusColor: (status: string) => string
}

export function LeadsTable({
  leads,
  brokers,
  onAssignClick,
  onDisqualifyClick,
  onViewDetails,
  selectedLead,
  assignToBroker,
  setAssignToBroker,
  handleAssignLead,
  getStatusColor,
}: LeadsTableProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Leads ({leads.length})</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Numéro</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigné à</TableHead>
              <TableHead>Détails</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-mono text-xs">{lead.lead_number}</TableCell>
                <TableCell className="font-medium">{lead.full_name}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{lead.email}</div>
                    <div className="text-gray-500">{lead.phone}</div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{lead.address}</TableCell>
                <TableCell className="text-sm">{lead.property_type}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                </TableCell>
                <TableCell>
                  {lead.assigned_to ? (
                    <div className="text-sm">{brokers.find((b) => b.id === lead.assigned_to)?.full_name || "N/A"}</div>
                  ) : (
                    <span className="text-gray-400 text-sm">Non-assigné</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => onViewDetails(lead.id)}>
                    Voir détails
                  </Button>
                </TableCell>
                <TableCell>
                  {selectedLead === lead.id ? (
                    /* ---------------- ASSIGN MODE ---------------- */
                    <div className="flex gap-2">
                      <Select value={assignToBroker} onValueChange={setAssignToBroker}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          {brokers
                            .filter((b) => b.is_active)
                            .map((broker) => (
                              <SelectItem key={broker.id} value={broker.id}>
                                {broker.full_name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Button
                        size="sm"
                        onClick={() => handleAssignLead(lead.id, assignToBroker)}
                        disabled={!assignToBroker}
                      >
                        OK
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onAssignClick("")
                          setAssignToBroker("")
                        }}
                      >
                        X
                      </Button>
                    </div>
                  ) : (
                    /* ---------------- DEFAULT MODE ---------------- */
                    <div className="flex gap-2">
                      {lead.assigned_to ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 bg-transparent"
                          onClick={() => handleAssignLead(lead.id, null)}
                        >
                          Désassigner
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAssignClick(lead.id)}
                        >
                          Assigner
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                        onClick={() => onDisqualifyClick(lead)}
                      >
                        Disqualifier
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
