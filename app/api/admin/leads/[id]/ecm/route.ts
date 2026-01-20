import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const supabase = getSupabaseAdmin()
    const { id: leadId } = await context.params

    console.log("[ECM API] Starting ECM creation/load for leadId:", leadId)

    const body = await request.json()
    const { leadData } = body

    if (!leadData) {
      console.error("[ECM API] Lead data not provided")
      return NextResponse.json({ error: "Lead data not provided" }, { status: 400 })
    }

    console.log("[ECM API] Checking for existing ECM...")

    let { data: ecm, error: ecmError } = await supabase
      .from("ecm_reports")
      .select("*")
      .eq("lead_id", leadId)
      .maybeSingle()

    if (ecmError && ecmError.code !== "PGRST116") {
      console.error("[ECM API] Database error checking ECM:", {
        message: ecmError.message,
        code: ecmError.code,
        details: ecmError.details,
        hint: ecmError.hint,
      })
      return NextResponse.json(
        {
          error: "Database error",
          details: ecmError.message,
        },
        { status: 500 },
      )
    }

    if (!ecm) {
      const fullAddress = [leadData.address, leadData.city, leadData.postal_code].filter(Boolean).join(", ").trim()

      const subjectPropertySnapshot = {
        address: fullAddress || "Adresse non spécifiée",
        city: leadData.city || "",
        postal_code: leadData.postal_code || "",
        property_type: leadData.property_type || "unifamiliale",
        bedrooms: Number(leadData.bedrooms_count || leadData.bedrooms || 0),
        bathrooms: Number(leadData.bathrooms_count || leadData.bathrooms || 0),
        powder_rooms: Number(leadData.powder_rooms_count || 0),
        year_built: leadData.construction_year || leadData.year_built || null,
        living_area: String(leadData.property_area || leadData.approximate_area || ""),
        features: String(leadData.property_highlights || leadData.features || ""),
        renovations: String(leadData.recent_renovations || leadData.renovations || ""),
        garage: String(leadData.garage || ""),
        basement: String(leadData.basement || ""),
      }

      console.log("[ECM API] Creating new ECM with snapshot")

      const { data: newEcm, error: createError } = await supabase
        .from("ecm_reports")
        .insert({
          lead_id: leadId,
          subject_property_snapshot: subjectPropertySnapshot,
          comparables: [],
          analyst_notes: "",
          range_low: 400000,
          range_high: 450000,
          generated_text: "",
          source_files: [],
        })
        .select()
        .single()

      if (createError) {
        console.error("[ECM API] Failed to create ECM:", {
          message: createError.message,
          code: createError.code,
          details: createError.details,
          hint: createError.hint,
        })
        return NextResponse.json(
          {
            error: "Failed to create ECM",
            message: createError.message,
            code: createError.code,
          },
          { status: 500 },
        )
      }

      ecm = newEcm
      console.log("[ECM API] ECM created successfully, ID:", ecm.id)
    } else {
      console.log("[ECM API] Found existing ECM, ID:", ecm.id)
    }

    return NextResponse.json({ lead: leadData, ecm })
  } catch (error: any) {
    console.error("[ECM API] Unexpected error:", error.message)
    console.error("[ECM API] Stack:", error.stack)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
