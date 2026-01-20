import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function PATCH(request: NextRequest, context: { params: Promise<{ ecmId: string }> }) {
  try {
    const { ecmId } = await context.params
    console.log("[ECM PATCH] 📝 Updating ECM:", ecmId)

    const supabase = getSupabaseAdmin()
    const body = await request.json()

    console.log("[ECM PATCH] 📦 Update payload:", JSON.stringify(body, null, 2))

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (body.comparables !== undefined) updateData.comparables = body.comparables
    if (body.analyst_notes !== undefined) updateData.analyst_notes = body.analyst_notes
    if (body.range_low !== undefined) updateData.range_low = body.range_low
    if (body.range_high !== undefined) updateData.range_high = body.range_high
    if (body.generated_text !== undefined) updateData.generated_text = body.generated_text
    if (body.status !== undefined) updateData.status = body.status

    console.log("[ECM PATCH] 💾 Saving to Supabase:", JSON.stringify(updateData, null, 2))

    const { data, error } = await supabase.from("ecm_reports").update(updateData).eq("id", ecmId).select().single()

    if (error) {
      console.error("[ECM PATCH] ❌ Supabase error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json({ error: "Failed to update ECM", details: error.message }, { status: 500 })
    }

    console.log("[ECM PATCH] ✅ ECM updated successfully")
    return NextResponse.json({ ecm: data })
  } catch (error) {
    console.error("[ECM PATCH] ❌ Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
