import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest, { params }: { params: { ecmId: string } }) {
  try {
    const { comparableId } = await request.json()
    const ecmId = params.ecmId

    if (!comparableId) {
      return NextResponse.json({ error: "Missing comparableId" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: ecm, error: fetchError } = await supabase.from("ecm_reports").select("*").eq("id", ecmId).single()

    if (fetchError || !ecm) {
      return NextResponse.json({ error: "ECM not found" }, { status: 404 })
    }

    const comparables = (ecm.comparables as any[]) || []
    const targetIndex = comparables.findIndex((c: any) => c.comparable_id === comparableId)

    if (targetIndex === -1) {
      return NextResponse.json({ error: "Comparable not found" }, { status: 404 })
    }

    const oldSubject = ecm.subject_property_snapshot
    const newSubject = comparables[targetIndex]

    const oldSubjectAsComparable = {
      comparable_id: `comp-${Date.now()}-old-subject`,
      status: "active",
      ...oldSubject,
    }

    comparables.splice(targetIndex, 1)
    comparables.push(oldSubjectAsComparable)

    const { data: updated, error: updateError } = await supabase
      .from("ecm_reports")
      .update({
        subject_property_snapshot: newSubject,
        comparables,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ecmId)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: "Failed to swap subject" }, { status: 500 })
    }

    return NextResponse.json({ success: true, ecm: updated })
  } catch (error) {
    console.error("Error in POST /api/admin/ecm/[ecmId]/set-subject:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
