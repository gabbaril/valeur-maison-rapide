import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const { email, password, fullName } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Create Auth user with admin API
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
        role: "broker",
      },
    })

    if (authError) {
      console.error("[CREATE AUTH] Error creating auth user:", authError)
      return NextResponse.json({ error: authError.message }, { status: 500 })
    }

    console.log("[CREATE AUTH] Successfully created auth user for:", email)

    return NextResponse.json({
      success: true,
      user: {
        id: authUser.user.id,
        email: authUser.user.email,
      },
    })
  } catch (err: any) {
    console.error("[CREATE AUTH] Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
