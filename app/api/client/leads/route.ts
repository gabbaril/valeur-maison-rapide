import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      },
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ ok: false, error: "Non authentifié" }, { status: 401 })
    }

    // Get leads assigned to this client
    const { data: assignments, error: assignError } = await supabase
      .from("lead_assignments")
      .select("*, leads(*)")
      .eq("client_id", user.id)
      .order("assigned_at", { ascending: false })

    if (assignError) {
      return NextResponse.json({ ok: false, error: assignError.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      leads: assignments?.map((a) => a.leads) || [],
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: `Exception: ${err.message}` }, { status: 500 })
  }
}
