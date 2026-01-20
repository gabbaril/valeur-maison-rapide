import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseAdmin()

    // Fetch lead details
    const { data: lead, error: leadError } = await supabase.from("leads").select("*").eq("id", params.id).single()

    if (leadError || !lead) {
      return NextResponse.json({ ok: false, error: "Lead non trouvé" }, { status: 404 })
    }

    // Fetch notes for this lead
    const { data: notes, error: notesError } = await supabase
      .from("lead_notes")
      .select("*")
      .eq("lead_id", params.id)
      .order("created_at", { ascending: false })

    if (notesError) {
      console.error("[v0] Error fetching notes:", notesError)
      return NextResponse.json({ ok: true, lead, notes: [] })
    }

    return NextResponse.json({ ok: true, lead, notes: notes || [] })
  } catch (err: any) {
    console.error("[v0] Exception in broker lead API:", err)
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}
