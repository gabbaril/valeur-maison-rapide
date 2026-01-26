import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: Request) {
  console.log("[v0 API] lead-by-token - Request received")
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  console.log("[v0 API] Token from URL:", token)

  if (!token) {
    console.log("[v0 API] No token provided")
    return NextResponse.json({ ok: false, error: "Token manquant" }, { status: 400 })
  }

  try {
    const supabase = getSupabaseAdmin()
    console.log("[v0 API] Querying database for token")

    // Find the token and verify it's valid
    const { data: tokenData, error: tokenError } = await supabase
      .from("lead_access_tokens")
      .select("*, leads(*)")
      .eq("token", token)
      .single()

    console.log("[v0 API] Token query result:", { hasData: !!tokenData, hasError: !!tokenError })

    if (tokenError || !tokenData) {
      console.log("[v0 API] Token not found or error:", tokenError?.message)
      return NextResponse.json({ ok: false, error: "Token invalide" }, { status: 404 })
    }

    // Check if token has already been used
    if (tokenData.is_used) {
      console.log("[v0 API] Token already used")
      return NextResponse.json(
        {
          ok: false,
          error:
            "Votre formulaire d'évaluation a déjà été complété. Votre dossier est désormais en priorité. Au besoin, l'expert local assigné à celui-ci vous contactera.",
        },
        { status: 403 },
      )
    }

    // Check if the lead has been finalized
    const lead = tokenData.leads

    console.log("[v0 API] Finalization check:", {
      is_used: tokenData.is_used,
      is_finalized: lead.is_finalized,
    })

    if (lead.is_finalized) {
      console.log("[v0 API] Lead already finalized")
      return NextResponse.json(
        {
          ok: false,
          error:
            "Votre formulaire d'évaluation a déjà été complété. Votre dossier est désormais en priorité. Au besoin, l'expert local assigné à celui-ci vous contactera.",
        },
        { status: 403 },
      )
    }

    console.log("[v0 API] Token valid, returning lead data")
    return NextResponse.json({
      ok: true,
      lead: tokenData.leads,
      token: tokenData,
    })
  } catch (err: any) {
    console.error("[v0 API] Exception:", err)
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}
