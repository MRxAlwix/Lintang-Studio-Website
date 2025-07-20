interface WhatsAppMessage {
  phone: string
  message: string
  orderId?: string
  pluginPurchaseId?: string
}

interface WhatsAppResponse {
  success: boolean
  messageId?: string
  error?: string
}

class WhatsAppService {
  private provider: string
  private apiUrl: string
  private token: string

  constructor() {
    this.provider = process.env.WHATSAPP_DEFAULT_PROVIDER || "wablas"

    switch (this.provider) {
      case "wablas":
        this.apiUrl = process.env.WABLAS_API_URL || ""
        this.token = process.env.WABLAS_TOKEN || ""
        break
      case "zenziva":
        this.apiUrl = process.env.ZENZIVA_API_URL || ""
        this.token = process.env.ZENZIVA_USERKEY || ""
        break
      case "ultramsg":
        this.apiUrl = `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE_ID}/messages/chat`
        this.token = process.env.ULTRAMSG_TOKEN || ""
        break
      default:
        throw new Error("Invalid WhatsApp provider")
    }
  }

  async sendMessage({ phone, message, orderId, pluginPurchaseId }: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      let response: Response
      let payload: any

      // Format phone number (remove + and ensure it starts with country code)
      const formattedPhone = phone.replace(/\D/g, "").replace(/^0/, "62")

      switch (this.provider) {
        case "wablas":
          payload = {
            phone: formattedPhone,
            message: message,
            secret: false,
            retry: false,
            isGroup: false,
          }
          response = await fetch(`${this.apiUrl}/send-message`, {
            method: "POST",
            headers: {
              Authorization: this.token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
          break

        case "zenziva":
          const zenziva_passkey = process.env.ZENZIVA_PASSKEY || ""
          payload = {
            userkey: this.token,
            passkey: zenziva_passkey,
            to: formattedPhone,
            message: message,
          }
          response = await fetch(`${this.apiUrl}/whatsapp/send-message`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          })
          break

        case "ultramsg":
          payload = {
            to: `${formattedPhone}@c.us`,
            body: message,
          }
          response = await fetch(this.apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              token: this.token,
              to: payload.to,
              body: payload.body,
            }),
          })
          break

        default:
          throw new Error("Provider not implemented")
      }

      const result = await response.json()

      // Log to database
      await this.logMessage({
        phone: formattedPhone,
        message,
        status: response.ok ? "sent" : "failed",
        provider: this.provider,
        responseData: result,
        orderId,
        pluginPurchaseId,
      })

      if (response.ok) {
        return {
          success: true,
          messageId: result.id || result.messageId || "unknown",
        }
      } else {
        return {
          success: false,
          error: result.message || result.error || "Failed to send message",
        }
      }
    } catch (error) {
      console.error("WhatsApp send error:", error)

      // Log failed attempt
      await this.logMessage({
        phone,
        message,
        status: "failed",
        provider: this.provider,
        responseData: { error: error instanceof Error ? error.message : "Unknown error" },
        orderId,
        pluginPurchaseId,
      })

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async logMessage(logData: {
    phone: string
    message: string
    status: string
    provider: string
    responseData: any
    orderId?: string
    pluginPurchaseId?: string
  }) {
    try {
      await fetch("/api/admin/wa-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logData),
      })
    } catch (error) {
      console.error("Failed to log WhatsApp message:", error)
    }
  }

  // Template messages
  static getPaymentSuccessMessage(customerName: string, serviceType: string, chatRoomId?: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://lintangstudio.com"
    const chatUrl = chatRoomId ? `${baseUrl}/chat/${chatRoomId}` : `${baseUrl}`

    return `Halo ${customerName}! 🎉

Pembayaran untuk ${serviceType} sudah berhasil dikonfirmasi.

Tim kami akan segera memulai pengerjaan proyek Anda. Untuk komunikasi selama proses pengerjaan, silakan gunakan chat support di:

${chatUrl}

Terima kasih atas kepercayaan Anda kepada Lintang Studio!

---
Lintang Studio
Professional Technical Design Services`
  }

  static getPluginPurchaseMessage(customerName: string, pluginName: string, downloadUrl?: string): string {
    return `Halo ${customerName}! 🎉

Pembelian plugin "${pluginName}" sudah berhasil dikonfirmasi.

${downloadUrl ? `Link download: ${downloadUrl}` : "Link download akan dikirim segera melalui email."}

Plugin dapat digunakan selamanya dan mendapat update gratis untuk versi minor.

Jika ada pertanyaan, silakan hubungi kami di WhatsApp ini.

---
Lintang Studio
Professional Technical Design Services`
  }
}

export const whatsappService = new WhatsAppService()
