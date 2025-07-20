"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X, CreditCard, Download, Star } from "lucide-react"
import { toast } from "sonner"
import { PromoCodeInput } from "@/components/promo-code-input"

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  price: number
  category: "autocad" | "sketchup"
  download_count: number
  rating: number
  features: string[]
}

interface PluginPurchaseModalProps {
  plugin: Plugin
  onClose: () => void
  onSuccess: () => void
}

interface PurchaseFormData {
  fullName: string
  email: string
  whatsapp: string
}

export function PluginPurchaseModal({ plugin, onClose, onSuccess }: PluginPurchaseModalProps) {
  const [formData, setFormData] = useState<PurchaseFormData>({
    fullName: "",
    email: "",
    whatsapp: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [finalAmount, setFinalAmount] = useState(plugin.price)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleInputChange = (field: keyof PurchaseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePromoApplied = (promoData: any) => {
    setAppliedPromo(promoData)
    setFinalAmount(promoData.final_amount)
  }

  const handlePromoRemoved = () => {
    setAppliedPromo(null)
    setFinalAmount(plugin.price)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/plugins/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pluginId: plugin.id,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerWhatsapp: formData.whatsapp,
          promoCode: appliedPromo?.promo_code || null,
          discountAmount: appliedPromo?.discount_amount || 0,
          finalAmount: finalAmount,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create purchase")
      }

      const result = await response.json()

      // Redirect to payment
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        toast.success("Pembelian berhasil dibuat! Anda akan dihubungi segera.")
        onSuccess()
      }
    } catch (error) {
      console.error("Error creating purchase:", error)
      toast.error("Gagal membuat pembelian. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Beli Plugin</CardTitle>
              <CardDescription>Lengkapi data untuk membeli plugin premium</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plugin Details */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{plugin.name}</h3>
                <p className="text-gray-600">Version {plugin.version}</p>
              </div>
              <Badge
                variant={plugin.category === "autocad" ? "default" : "secondary"}
                className={plugin.category === "autocad" ? "bg-blue-600" : "bg-green-600"}
              >
                {plugin.category === "autocad" ? "AutoCAD" : "SketchUp"}
              </Badge>
            </div>

            <p className="text-gray-700 mb-4">{plugin.description}</p>

            {/* Features */}
            {plugin.features && plugin.features.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Fitur yang Anda dapatkan:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {plugin.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-1">
                <Download className="w-4 h-4" />
                <span>{plugin.download_count} downloads</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{plugin.rating} rating</span>
              </div>
            </div>

            {/* Price */}
            <div className="border-t pt-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Harga Plugin:</span>
                  <span className="text-lg text-gray-900">{formatCurrency(plugin.price)}</span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-green-600">
                    <span>Diskon ({appliedPromo.promo_name}):</span>
                    <span>-{formatCurrency(appliedPromo.discount_amount)}</span>
                  </div>
                )}

                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Pembayaran:</span>
                    <span className="text-2xl font-bold text-blue-600">{formatCurrency(finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-lg">Informasi Pembeli</h3>

            {/* Promo Code */}
            <PromoCodeInput
              amount={plugin.price}
              type="plugins"
              onPromoApplied={handlePromoApplied}
              onPromoRemoved={handlePromoRemoved}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="nama@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">Nomor WhatsApp *</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange("whatsapp", e.target.value)}
                placeholder="+62 812 3456 7890"
                required
              />
            </div>

            {/* Terms */}
            <div className="bg-blue-50 rounded-lg p-4 text-sm">
              <h4 className="font-medium text-blue-900 mb-2">Ketentuan Pembelian:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Plugin dapat didownload setelah pembayaran berhasil</li>
                <li>• Link download berlaku selamanya</li>
                <li>• Mendapat update gratis untuk versi minor</li>
                <li>• Support teknis melalui WhatsApp</li>
                <li>• Tidak dapat dikembalikan setelah download</li>
              </ul>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Batal
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {isLoading ? (
                  "Memproses..."
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Bayar Sekarang
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
