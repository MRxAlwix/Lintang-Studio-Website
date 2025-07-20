// WhatsApp API Integration
// Supports multiple providers: Wablas, Zenziva, Ultramsg

interface WhatsAppMessage {
  phone: string
  message: string
  type?: "text" | "template"
  orderId?: string
  pluginPurchaseId?: string
}

interface WhatsAppResponse {
  success: boolean
  messageId?: string
  error?: string
  provider: string
}

// Message templates
export const messageTemplates = {
  orderSuccess: (customerName: string, orderId: string, chatRoomId: string) =>
    `Halo ${customerName}! 🎉\n\nPembayaran order ${orderId} berhasil dikonfirmasi.\n\nSilakan buka chat room untuk komunikasi dengan tim kami:\n${process.env.NEXT_PUBLIC_BASE_URL}/chat/${chatRoomId}\n\nTerima kasih telah mempercayai Lintang Studio! 🏗️`,

  pluginPurchase: (customerName: string, pluginName: string, downloadUrl: string) =>
    `Halo ${customerName}! 🎉\n\nPlugin "${pluginName}" berhasil dibeli.\n\nSilakan download di:\n${downloadUrl}\n\nTerima kasih telah berbelanja di Lintang Studio! 🔧`,

  paymentReminder: (customerName: string, orderId: string) =>
    `Halo ${customerName},\n\nOrder ${orderId} menunggu pembayaran.\n\nSilakan selesaikan pembayaran untuk melanjutkan proses.\n\nTerima kasih! 💳`,

  projectUpdate: (customerName: string, projectStatus: string) =>
    `Halo ${customerName},\n\nUpdate proyek Anda: ${projectStatus}\n\nCek chat room untuk detail lebih lanjut.\n\nSalam, Tim Lintang Studio 📐`,
}

// Wablas API
async function sendViaWablas(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`${process.env.WABLAS_API_URL}/send-message`, {
      method: "POST",
      headers: {
        Authorization: process.env.WABLAS_TOKEN!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: message.phone,
        message: message.message,
        isGroup: false,
      }),
    })

    const data = await response.json()

    if (response.ok && data.status) {
      return {
        success: true,
        messageId: data.data?.id,
        provider: "wablas",
      }
    } else {
      throw new Error(data.message || "Wablas API error")
    }
  } catch (error) {
    console.error("Wablas error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      provider: "wablas",
    }
  }
}

// Zenziva API
async function sendViaZenziva(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`${process.env.ZENZIVA_API_URL}/v1/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userkey: process.env.ZENZIVA_USERKEY,
        passkey: process.env.ZENZIVA_PASSKEY,
        to: message.phone,
        message: message.message,
      }),
    })

    const data = await response.json()

    if (response.ok && data.status === 1) {
      return {
        success: true,
        messageId: data.messageId,
        provider: "zenziva",
      }
    } else {
      throw new Error(data.text || "Zenziva API error")
    }
  } catch (error) {
    console.error("Zenziva error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      provider: "zenziva",
    }
  }
}

// Ultramsg API
async function sendViaUltramsg(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  try {
    const response = await fetch(`https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        token: process.env.ULTRAMSG_TOKEN!,
        to: message.phone,
        body: message.message,
      }),
    })

    const data = await response.json()

    if (response.ok && data.sent) {
      return {
        success: true,
        messageId: data.id,
        provider: "ultramsg",
      }
    } else {
      throw new Error(data.error || "Ultramsg API error")
    }
  } catch (error) {
    console.error("Ultramsg error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      provider: "ultramsg",
    }
  }
}

// Main function with fallback providers
export async function sendWhatsAppMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
  const providers = [
    { name: "wablas", func: sendViaWablas },
    { name: "zenziva", func: sendViaZenziva },
    { name: "ultramsg", func: sendViaUltramsg },
  ]

  // Try default provider first
  const defaultProvider = process.env.WHATSAPP_DEFAULT_PROVIDER || "wablas"
  const primaryProvider = providers.find((p) => p.name === defaultProvider)

  if (primaryProvider) {
    const result = await primaryProvider.func(message)
    if (result.success) {
      return result
    }
    console.warn(`Primary provider ${defaultProvider} failed, trying fallbacks...`)
  }

  // Try other providers as fallback
  for (const provider of providers) {
    if (provider.name === defaultProvider) continue

    console.log(`Trying fallback provider: ${provider.name}`)
    const result = await provider.func(message)

    if (result.success) {
      console.log(`Fallback provider ${provider.name} succeeded`)
      return result
    }
  }

  // All providers failed
  return {
    success: false,
    error: "All WhatsApp providers failed",
    provider: "none",
  }
}

// Utility functions
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digits
  let cleaned = phone.replace(/\D/g, "")

  // Handle Indonesian numbers
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.substring(1)
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned
  }

  return cleaned
}

export function validatePhoneNumber(phone: string): boolean {
  const formatted = formatPhoneNumber(phone)
  return /^62\d{9,13}$/.test(formatted)
}
