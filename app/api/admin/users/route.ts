import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET() {
  try {
    // Récupérer tous les utilisateurs de Supabase Auth
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
      console.error("Erreur Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Formater les utilisateurs avec les informations pertinentes
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: user.email?.includes("courtier") ? "Courtier" : "Client",
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
