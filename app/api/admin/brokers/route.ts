import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase.from("brokers").select("*").order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseAdmin()
    const body = await request.json()

    const { email, fullName, companyName, phone, territory, password } = body

    const tempPassword = password || `Temp${Math.random().toString(36).slice(2, 10)}!`

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: "broker",
      },
    })

    if (authError) {
      console.error("[Brokers API] Auth creation error:", authError)
      return NextResponse.json({ error: `Erreur création compte Auth: ${authError.message}` }, { status: 500 })
    }

    // Le trigger handle_new_broker créera automatiquement l'entrée dans la table brokers
    // On met à jour les informations supplémentaires
    const { data, error } = await supabase
      .from("brokers")
      .update({
        full_name: fullName,
        company_name: companyName,
        phone,
        territory,
        is_active: true,
      })
      .eq("id", authData.user.id)
      .select()
      .single()

    if (error) {
      console.error("[Brokers API] Broker update error:", error)
      // Si l'update échoue, on essaie un insert direct
      const { data: insertData, error: insertError } = await supabase
        .from("brokers")
        .insert({
          id: authData.user.id,
          email,
          full_name: fullName,
          company_name: companyName,
          phone,
          territory,
          is_active: true,
        })
        .select()
        .single()

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({
        ...insertData,
        tempPassword: password ? undefined : tempPassword,
        message: password ? undefined : `Mot de passe temporaire: ${tempPassword}`,
      })
    }

    return NextResponse.json({
      ...data,
      tempPassword: password ? undefined : tempPassword,
      message: password ? undefined : `Mot de passe temporaire: ${tempPassword}`,
    })
  } catch (err: any) {
    console.error("[Brokers API] Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
