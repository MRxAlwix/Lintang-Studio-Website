"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react"

export default function PaymentErrorPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Pembayaran Gagal</CardTitle>
          <CardDescription>Terjadi kesalahan saat memproses pembayaran Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">{orderId}</span>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Kemungkinan Penyebab:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 text-left">
                <li>• Saldo kartu/rekening tidak mencukupi</li>
                <li>• Koneksi internet terputus</li>
                <li>• Sesi pembayaran telah berakhir</li>
                <li>• Pembayaran dibatalkan</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-3">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi
              </Button>

              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>💬 Butuh bantuan? Hubungi kami di WhatsApp</p>
            <p>📞 +62 812 3456 7890</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
