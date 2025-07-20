"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowLeft, MessageCircle, ExternalLink } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("order_id")
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [chatRoomId, setChatRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId)
      // Check for chat room after a delay to allow for trigger processing
      setTimeout(() => {
        checkChatRoom(orderId)
      }, 3000)
    }
  }, [orderId])

  const fetchOrderDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/orders/${id}`)
      if (response.ok) {
        const data = await response.json()
        setOrderDetails(data)
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
    }
  }

  const checkChatRoom = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/rooms/by-order/${id}`)
      if (response.ok) {
        const data = await response.json()
        setChatRoomId(data.id)
      }
    } catch (error) {
      console.error("Error checking chat room:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Pembayaran Berhasil!</CardTitle>
          <CardDescription>Terima kasih atas kepercayaan Anda kepada Lintang Studio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderDetails && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderDetails.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layanan:</span>
                <span className="font-medium">{orderDetails.service_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium text-green-600">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                  }).format(orderDetails.amount)}
                </span>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Langkah Selanjutnya:</h3>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>✅ Chat room telah dibuat untuk komunikasi</li>
                <li>✅ Tim kami akan menghubungi Anda segera</li>
                <li>✅ Diskusi detail proyek melalui chat</li>
                <li>✅ Update progress secara berkala</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-gray-600">Menyiapkan chat room...</span>
                </div>
              ) : chatRoomId ? (
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <Link href={`/chat/${chatRoomId}`}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Buka Chat Room
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              ) : (
                <div className="text-sm text-gray-600 p-4 bg-yellow-50 rounded-lg">
                  <p>Chat room sedang disiapkan. Silakan refresh halaman dalam beberapa saat.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="mt-2 bg-transparent"
                  >
                    Refresh Halaman
                  </Button>
                </div>
              )}

              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>📧 Konfirmasi pembayaran telah dikirim ke email Anda</p>
            <p>💬 Gunakan chat room untuk komunikasi langsung dengan tim</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
