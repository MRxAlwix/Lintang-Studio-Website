"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Tag, Check, X } from "lucide-react"
import { toast } from "sonner"

interface PromoCodeInputProps {
  amount: number
  type?: "services" | "plugins" | "all"
  onPromoApplied: (promoData: any) => void
  onPromoRemoved: () => void
  className?: string
}

export function PromoCodeInput({
  amount,
  type = "all",
  onPromoApplied,
  onPromoRemoved,
  className = "",
}: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState("")
  const [isValidating, setIsValidating] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const validatePromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error("Masukkan kode promo")
      return
    }

    setIsValidating(true)

    try {
      const response = await fetch("/api/promos/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promoCode: promoCode.trim(),
          amount,
          type,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to validate promo code")
      }

      if (result.valid) {
        setAppliedPromo(result)
        onPromoApplied(result)
        toast.success(`Kode promo berhasil diterapkan! Hemat ${formatCurrency(result.discount_amount)}`)
      } else {
        toast.error(result.message || "Kode promo tidak valid")
      }
    } catch (error) {
      console.error("Error validating promo:", error)
      toast.error("Gagal memvalidasi kode promo")
    } finally {
      setIsValidating(false)
    }
  }

  const removePromo = () => {
    setAppliedPromo(null)
    setPromoCode("")
    onPromoRemoved()
    toast.success("Kode promo dihapus")
  }

  if (appliedPromo) {
    return (
      <div className={`space-y-3 ${className}`}>
        <Label>Kode Promo</Label>
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Check className="w-4 h-4 text-green-600" />
            <div>
              <div className="font-medium text-green-800">{appliedPromo.promo_name}</div>
              <div className="text-sm text-green-600">Hemat {formatCurrency(appliedPromo.discount_amount)}</div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removePromo}
            className="text-green-600 hover:text-green-800"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label htmlFor="promoCode">Kode Promo (Opsional)</Label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="promoCode"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Masukkan kode promo"
            className="pl-10"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                validatePromoCode()
              }
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={validatePromoCode}
          disabled={isValidating || !promoCode.trim()}
        >
          {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Terapkan"}
        </Button>
      </div>

      {/* Sample promo codes hint */}
      <div className="text-xs text-gray-500">
        <div className="flex flex-wrap gap-1">
          <span>Coba:</span>
          {["DISKON50", "JULI20", type === "plugins" ? "PLUGIN10" : "NEWCLIENT"].map((code) => (
            <Badge
              key={code}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              onClick={() => setPromoCode(code)}
            >
              {code}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
