import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const adminSecret = searchParams.get("secret")

    // Verify admin authorization
    if (!adminSecret || adminSecret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 })
    }

    const supabase = getSupabaseAdmin()

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, clients })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { adminSecret, email, full_name, company_name, phone } = body

    // Verify admin authorization
    if (!adminSecret || adminSecret !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 })
    }

    if (!email || !full_name) {
      return NextResponse.json({ ok: false, error: "Email et nom requis" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()

    const { data: client, error } = await supabase
      .from("clients")
      .insert({
        email,
        full_name,
        company_name: company_name || null,
        phone: phone || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, client })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}
