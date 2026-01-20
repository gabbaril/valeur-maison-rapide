import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    const { userId, newPassword } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID requis" }, { status: 400 })
    }

    // Mettre à jour le mot de passe de l'utilisateur
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: newPassword })

    if (error) {
      console.error("Erreur Supabase:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    })
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
