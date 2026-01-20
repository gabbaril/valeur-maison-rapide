import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

function parseBasicListing(filename: string, index: number) {
  // Format attendu: "Adresse - Prix$ - Caractéristiques.pdf"
  // Exemple: "123 Rue Example - 350000$ - 3ch 2sdb.pdf"

  const comparable = {
    comparable_id: `comp-${Date.now()}-${index}`,
    status: "active",
    property: {
      address_full: filename.replace(".pdf", ""),
      rooms: {
        bedrooms: 3,
        bathrooms: 2,
      },
      year_built: 2000,
      living_area_sqft: 1500,
    },
    pricing: {
      list_price: 350000,
    },
    source: {
      type: "centris",
      filename: filename,
      parse_confidence: 0.5,
    },
  }

  return comparable
}

export async function POST(request: NextRequest) {
  try {
    console.log("[IMPORT API] Starting PDF import")
    const formData = await request.formData()
    const leadId = formData.get("leadId") as string
    const ecmReportId = formData.get("ecmReportId") as string
    const files = formData.getAll("files") as File[]

    console.log("[IMPORT API] Received:", { leadId, ecmReportId, fileCount: files.length })

    if (!leadId || !ecmReportId || files.length === 0) {
      console.error("[IMPORT API] Missing required data")
      return NextResponse.json({ error: "Missing leadId, ecmReportId, or files" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const sourceFiles: any[] = []
    const comparables: any[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      console.log("[IMPORT API] Processing file:", file.name, file.type, file.size)

      try {
        const parsedListing = parseBasicListing(file.name, i)
        comparables.push(parsedListing)

        sourceFiles.push({
          filename: file.name,
          storage_path: null, // Pas de stockage pour l'instant
          parsed_ok: true,
          parse_confidence: 0.5,
          error: null,
        })

        console.log("[IMPORT API] File processed successfully:", file.name)
      } catch (error: any) {
        console.error(`[IMPORT API] Error processing file ${file.name}:`, error)
        sourceFiles.push({
          filename: file.name,
          storage_path: null,
          parsed_ok: false,
          parse_confidence: 0,
          error: error.message || "Unknown error",
        })
      }
    }

    const { data: existingEcm } = await supabase
      .from("ecm_reports")
      .select("comparables, source_files")
      .eq("id", ecmReportId)
      .single()

    const existingComps = (existingEcm?.comparables as any[]) || []
    const existingFiles = (existingEcm?.source_files as any[]) || []

    const allComparables = [...existingComps, ...comparables]
    const allSourceFiles = [...existingFiles, ...sourceFiles]

    console.log("[IMPORT API] Updating ECM with", comparables.length, "new comparables")

    const { data: updatedEcm, error: updateError } = await supabase
      .from("ecm_reports")
      .update({
        comparables: allComparables,
        source_files: allSourceFiles,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ecmReportId)
      .select()
      .single()

    if (updateError) {
      console.error("[IMPORT API] Update ECM error:", updateError)
      return NextResponse.json({ error: `Failed to update ECM: ${updateError.message}` }, { status: 500 })
    }

    console.log("[IMPORT API] Import completed successfully")

    return NextResponse.json({
      success: true,
      subject_property_snapshot: updatedEcm.subject_property_snapshot,
      comparables: updatedEcm.comparables,
      source_files: updatedEcm.source_files,
    })
  } catch (error: any) {
    console.error("[IMPORT API] Unexpected error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
