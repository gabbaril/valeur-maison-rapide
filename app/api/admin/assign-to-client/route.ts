import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { adminSecret, leadId, clientId } = body

    // Verify admin authorization
    if (!adminSecret || adminSecret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 })
    }

    if (!leadId || !clientId) {
      return NextResponse.json({ ok: false, error: "Lead ID et Client ID requis" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    // Create assignment
    const { data: assignment, error: assignError } = await supabase
      .from("lead_assignments")
      .insert({
        lead_id: leadId,
        client_id: clientId,
        assigned_by: "admin",
      })
      .select()
      .single()

    if (assignError) {
      // Check if already assigned
      if (assignError.code === "23505") {
        return NextResponse.json({ ok: false, error: "Lead déjà assigné à ce client" }, { status: 400 })
      }
      return NextResponse.json({ ok: false, error: assignError.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, assignment })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}
