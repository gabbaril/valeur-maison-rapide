import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("[v0] Fetching lead details for ID:", id)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: lead, error } = await supabase
      .from("leads")
      .select(`
        *,
        brokers:assigned_to (
          id,
          full_name,
          email,
          company_name
        )
      `)
      .eq("id", id)
      .single()

    if (error || !lead) {
      console.error("[v0] Error fetching lead:", error)
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json(lead)
  } catch (error) {
    console.error("[v0] Error in lead GET API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { brokerId } = (await request.json()) as {
      brokerId?: string | null
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const updates =
      brokerId
        ? {
            assigned_to: brokerId,
            status: "assigned",
            assigned_at: new Date().toISOString(),
          }
        : {
            assigned_to: null,
            status: "unassigned",
            assigned_at: null,
          }

    const { error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)

    if (error) {
      console.error("[v0] Error updating lead:", error)
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    console.error("[v0] Error in PATCH lead:", error)
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 }
    )
  }
}
