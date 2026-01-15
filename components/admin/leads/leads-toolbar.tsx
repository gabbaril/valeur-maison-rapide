"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, LayoutGrid, Table } from "lucide-react"

interface Broker {
  id: string
  full_name: string
}

interface LeadsToolbarProps {
  search: string
  setSearch: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  assignedFilter?: string
  setAssignedFilter?: React.Dispatch<React.SetStateAction<string>>
  propertyTypeFilter: string
  setPropertyTypeFilter: (value: string) => void
  sort: "desc" | "asc"
  setSort: (value: "desc" | "asc") => void
  view: "kanban" | "table"
  setView: (value: "kanban" | "table") => void
  brokers: Broker[]
  statuses: string[]
  propertyTypes: string[]
}

export function LeadsToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  assignedFilter,
  setAssignedFilter,
  propertyTypeFilter,
  setPropertyTypeFilter,
  sort,
  setSort,
  view,
  setView,
  brokers,
  statuses,
  propertyTypes,
}: LeadsToolbarProps) {
  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher (nom, email, téléphone, adresse...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {assignedFilter !== undefined && setAssignedFilter && (
        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assignation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            {brokers
              .filter((b) => b)
              .map((broker) => (
                <SelectItem key={broker.id} value={broker.id}>
                  {broker.full_name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        )}

        <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type de propriété" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v) => setSort(v as "desc" | "asc")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Plus récent</SelectItem>
            <SelectItem value="asc">Plus ancien</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          {assignedFilter !== undefined && setAssignedFilter && (
          <Button variant={view === "kanban" ? "default" : "outline"} size="sm" onClick={() => setView("kanban")}>
            <LayoutGrid className="h-4 w-4" />
          </Button>
          )}
          <Button variant={view === "table" ? "default" : "outline"} size="sm" onClick={() => setView("table")}>
            <Table className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
