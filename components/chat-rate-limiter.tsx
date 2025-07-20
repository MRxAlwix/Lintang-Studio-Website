"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Clock, Ban, MessageCircle } from "lucide-react"

interface ChatRateLimiterProps {
  roomId: string
  userEmail: string
  onRateLimitChange: (isLimited: boolean, reason?: string, retryAfter?: number) => void
}

interface RateLimitStatus {
  allowed: boolean
  reason?: string
  retry_after?: number
  user_status?: string
  consecutive_messages?: number
  spam_score?: number
}

export function ChatRateLimiter({ roomId, userEmail, onRateLimitChange }: ChatRateLimiterProps) {
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus>({ allowed: true })
  const [countdown, setCountdown] = useState(0)
  const [lastCheckTime, setLastCheckTime] = useState(0)

  useEffect(() => {
    checkRateLimit()
  }, [roomId, userEmail])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          const newCount = Math.max(0, prev - 1)
          if (newCount === 0) {
            checkRateLimit()
          }
          return newCount
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [countdown])

  const checkRateLimit = async () => {
    try {
      const response = await fetch("/api/chat/rate-limit/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
          user_email: userEmail,
        }),
      })

      if (response.ok) {
        const status: RateLimitStatus = await response.json()
        setRateLimitStatus(status)
        setLastCheckTime(Date.now())

        if (!status.allowed && status.retry_after) {
          setCountdown(Math.ceil(status.retry_after))
        }

        onRateLimitChange(status.allowed, status.reason, status.retry_after)
      }
    } catch (error) {
      console.error("Error checking rate limit:", error)
    }
  }

  const getRateLimitMessage = () => {
    switch (rateLimitStatus.reason) {
      case "payment_not_confirmed":
        return {
          title: "Pembayaran Belum Dikonfirmasi",
          description: "Chat hanya tersedia setelah pembayaran berhasil dikonfirmasi.",
          icon: Ban,
          variant: "destructive" as const,
        }
      case "rate_limit_exceeded":
        return {
          title: "Terlalu Cepat Mengirim Pesan",
          description: `Mohon tunggu ${countdown} detik sebelum mengirim pesan berikutnya.`,
          icon: Clock,
          variant: "default" as const,
        }
      case "too_many_consecutive_messages":
        return {
          title: "Terlalu Banyak Pesan Berturut-turut",
          description: "Anda telah mengirim terlalu banyak pesan tanpa respon admin. Chat dinonaktifkan sementara.",
          icon: AlertTriangle,
          variant: "destructive" as const,
        }
      case "input_disabled":
        return {
          title: "Chat Dinonaktifkan Sementara",
          description: `Chat akan aktif kembali dalam ${Math.ceil(countdown / 60)} menit.`,
          icon: Ban,
          variant: "destructive" as const,
        }
      case "rate_limited":
        return {
          title: "Rate Limit Aktif",
          description: `Anda terkena rate limit. Coba lagi dalam ${countdown} detik.`,
          icon: Clock,
          variant: "default" as const,
        }
      default:
        return null
    }
  }

  const getUserStatusBadge = () => {
    switch (rateLimitStatus.user_status) {
      case "frequent_asker":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Sering Bertanya
          </Badge>
        )
      case "spam_warning":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Peringatan Spam
          </Badge>
        )
      case "temporarily_blocked":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Diblokir Sementara
          </Badge>
        )
      case "unpaid":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Belum Bayar
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Aktif
          </Badge>
        )
    }
  }

  const rateLimitMessage = getRateLimitMessage()

  if (rateLimitStatus.allowed) {
    return (
      <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-700">Chat aktif</span>
        </div>
        {getUserStatusBadge()}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {rateLimitMessage && (
        <Alert variant={rateLimitMessage.variant}>
          <rateLimitMessage.icon className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div>
                <strong>{rateLimitMessage.title}</strong>
              </div>
              <div>{rateLimitMessage.description}</div>
              {countdown > 0 && (
                <div className="space-y-2">
                  <Progress value={(countdown / (rateLimitStatus.retry_after || 1)) * 100} className="h-2" />
                  <div className="text-xs text-gray-600">
                    Sisa waktu: {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                  </div>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* User Status Info */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Status:</span>
          {getUserStatusBadge()}
        </div>
        {rateLimitStatus.consecutive_messages !== undefined && rateLimitStatus.consecutive_messages > 5 && (
          <div className="text-xs text-gray-600">Pesan berturut: {rateLimitStatus.consecutive_messages}/10</div>
        )}
      </div>
    </div>
  )
}
