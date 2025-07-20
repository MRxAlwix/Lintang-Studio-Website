import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true"

const MIDTRANS_BASE_URL = MIDTRANS_IS_PRODUCTION
  ? "https://app.midtrans.com/snap/v1/transactions"
  : "https://app.sandbox.midtrans.com/snap/v1/transactions"

interface OrderData {
  fullName: string
  email: string
  whatsapp: string
  service: string
  area: string
  notes: string
  estimatedPrice: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form data
    const orderData: OrderData = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      service: formData.get("service") as string,
      area: formData.get("area") as string,
      notes: formData.get("notes") as string,
      estimatedPrice: formData.get("estimatedPrice") as string,
    }

    // Validate required fields
    if (!orderData.fullName || !orderData.email || !orderData.whatsapp || !orderData.service || !orderData.area) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate unique order ID
    const orderId = `LS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const amount = Number.parseInt(orderData.estimatedPrice) || 0

    // Handle file uploads to Supabase Storage
    const uploadedFiles: string[] = []
    const files = formData.getAll("file") as File[]

    for (let i = 0; i < files.length; i++) {
      const file = formData.get(`file_${i}`) as File
      if (file && file.size > 0) {
        const fileName = `${orderId}/${Date.now()}-${file.name}`

        const { data, error } = await supabase.storage.from("order-files").upload(fileName, file)

        if (error) {
          console.error("File upload error:", error)
        } else {
          uploadedFiles.push(data.path)
        }
      }
    }

    // Create order in Supabase
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        customer_name: orderData.fullName,
        customer_email: orderData.email,
        customer_whatsapp: orderData.whatsapp,
        service_type: orderData.service,
        area: Number.parseFloat(orderData.area),
        notes: orderData.notes,
        amount: amount,
        status: "pending_payment",
        files: uploadedFiles,
      })
      .select()
      .single()

    if (orderError) {
      console.error("Order creation error:", orderError)
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }

    // Create Midtrans payment
    if (MIDTRANS_SERVER_KEY && amount > 0) {
      const midtransPayload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: {
          first_name: orderData.fullName,
          email: orderData.email,
          phone: orderData.whatsapp,
        },
        item_details: [
          {
            id: orderData.service,
            price: amount,
            quantity: 1,
            name: `Jasa Desain - ${orderData.service}`,
            category: "Design Service",
          },
        ],
        callbacks: {
          finish: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order_id=${orderId}`,
          error: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/error?order_id=${orderId}`,
          pending: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/pending?order_id=${orderId}`,
        },
      }

      const midtransResponse = await fetch(MIDTRANS_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ":").toString("base64")}`,
        },
        body: JSON.stringify(midtransPayload),
      })

      if (midtransResponse.ok) {
        const paymentData = await midtransResponse.json()

        // Update order with payment token
        await supabase.from("orders").update({ payment_token: paymentData.token }).eq("id", orderId)

        return NextResponse.json({
          success: true,
          orderId: orderId,
          paymentUrl: paymentData.redirect_url,
          paymentToken: paymentData.token,
        })
      } else {
        console.error("Midtrans error:", await midtransResponse.text())
      }
    }

    // If no payment gateway or amount is 0, return success without payment
    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: "Order created successfully. You will be contacted soon.",
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
