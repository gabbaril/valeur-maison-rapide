import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.replace("Bearer ", "")

    // Verify session using Supabase Auth Admin endpoint
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch only this broker's leads
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("assigned_to", user.id)
      .order("created_at", { ascending: false })

    if (error) throw error

    // Build CSV
    const csvHeader = "Lead Number,Full Name,Email,Phone,Address,City,Postal Code,Property Type,Status,Created At\n"
    const csvRows = leads!.map((l: any) =>
      [
        l.lead_number,
        l.full_name,
        l.email,
        l.phone,
        l.address,
        l.city || "",
        l.postal_code || "",
        l.property_type,
        l.status,
        l.created_at,
      ].map((v) => `"${v}"`).join(",")
    )
    const csv = csvHeader + csvRows.join("\n")

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads.csv"`,
      },
    })
  } catch (err) {
    console.error("Export error:", err)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}