import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()
    const { leadId, brokerId } = body

    const { data, error } = await supabase
      .from("leads")
      .update({
        assigned_to: brokerId,
        status: "assigned",
        assigned_at: new Date().toISOString(),
      })
      .eq("id", leadId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
