import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> } // notice params is a Promise
) {
  try {
    const { id: brokerId } = await context.params // <-- unwrap the Promise
    if (!brokerId) return NextResponse.json({ error: "Broker ID missing" }, { status: 400 })

    const supabase = getSupabaseAdmin()

    // Prevent deletion if user exists
    const { data: user } = await supabase.from("users").select("*").eq("broker_id", brokerId).single()
    if (user) return NextResponse.json({ error: "Impossible de supprimer : un utilisateur est associé" }, { status: 400 })

    // Prevent deletion if leads exist
    const { data: leads } = await supabase.from("leads").select("*").eq("assigned_to", brokerId).limit(1)
    if (leads && leads.length > 0) return NextResponse.json({ error: "Impossible de supprimer : des leads sont attribués" }, { status: 400 })

    // Delete broker
    const { error: deleteError } = await supabase.from("brokers").delete().eq("id", brokerId)
    if (deleteError) throw deleteError

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Error deleting broker:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
