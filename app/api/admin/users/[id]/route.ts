import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  console.log("Route hit!", params)

  const userId = params.id
  if (!userId) {
    return NextResponse.json({ error: "User ID missing" }, { status: 400 })
  }

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
      console.error("Supabase delete error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Delete user error:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
