import { Card } from "@/components/ui/card"

interface Broker {
  is_active: boolean
}

interface Lead {
  assigned_to: string | null
}

interface KpiCardsProps {
  leads: Lead[]
  brokers: Broker[]
}

export function KpiCards({ leads, brokers }: KpiCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-6">
        <div className="text-sm font-medium text-gray-600">Nombre total de leads</div>
        <div className="text-3xl font-bold text-gray-900 mt-2">{leads.length}</div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-medium text-gray-600">Leads Non-Assignés</div>
        <div className="text-3xl font-bold text-red-600 mt-2">{leads.filter((l) => !l.assigned_to).length}</div>
      </Card>
      <Card className="p-6">
        <div className="text-sm font-medium text-gray-600">Clients Actifs</div>
        <div className="text-3xl font-bold text-gray-900 mt-2">{brokers.filter((b) => b.is_active).length}</div>
      </Card>
    </div>
  )
}
