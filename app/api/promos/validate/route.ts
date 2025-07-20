import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { promoCode, amount, type = "all" } = await request.json()

    if (!promoCode || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call the database function to validate and apply promo
    const { data, error } = await supabase.rpc("apply_promo_discount", {
      promo_code_input: promoCode.toUpperCase(),
      order_amount: amount,
      order_type: type,
    })

    if (error) {
      console.error("Promo validation error:", error)
      return NextResponse.json({ error: "Failed to validate promo code" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
