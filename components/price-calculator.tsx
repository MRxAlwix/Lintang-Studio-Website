"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, ArrowRight } from "lucide-react"

interface ServicePrice {
  id: string
  name: string
  basePrice: number
  pricePerM2: number
  minArea: number
  category: string
  description: string
}

const servicePrices: ServicePrice[] = [
  {
    id: "autocad-2d-basic",
    name: "AutoCAD 2D Basic",
    basePrice: 300000,
    pricePerM2: 15000,
    minArea: 36,
    category: "AutoCAD 2D",
    description: "Denah, tampak, potongan dasar",
  },
  {
    id: "autocad-2d-premium",
    name: "AutoCAD 2D Premium",
    basePrice: 500000,
    pricePerM2: 25000,
    minArea: 36,
    category: "AutoCAD 2D",
    description: "Lengkap dengan detail konstruksi",
  },
  {
    id: "sketchup-3d-basic",
    name: "SketchUp 3D Basic",
    basePrice: 400000,
    pricePerM2: 20000,
    minArea: 36,
    category: "SketchUp 3D",
    description: "3D modeling dengan rendering sederhana",
  },
  {
    id: "sketchup-3d-premium",
    name: "SketchUp 3D Premium",
    basePrice: 750000,
    pricePerM2: 35000,
    minArea: 36,
    category: "SketchUp 3D",
    description: "3D modeling + rendering realistis + walkthrough",
  },
  {
    id: "rab-sederhana",
    name: "RAB Sederhana",
    basePrice: 250000,
    pricePerM2: 12000,
    minArea: 36,
    category: "RAB",
    description: "Analisa harga satuan + BOQ",
  },
  {
    id: "rab-lengkap",
    name: "RAB Lengkap",
    basePrice: 400000,
    pricePerM2: 18000,
    minArea: 36,
    category: "RAB",
    description: "RAB + Time Schedule + Cash Flow",
  },
]

interface PriceCalculatorProps {
  onOrderClick?: (service: ServicePrice, area: number, totalPrice: number) => void
}

export function PriceCalculator({ onOrderClick }: PriceCalculatorProps) {
  const [selectedService, setSelectedService] = useState<ServicePrice | null>(null)
  const [area, setArea] = useState<string>("")
  const [totalPrice, setTotalPrice] = useState<number>(0)

  useEffect(() => {
    if (selectedService && area) {
      const areaNum = Number.parseFloat(area)
      if (areaNum >= selectedService.minArea) {
        const calculatedPrice = selectedService.basePrice + areaNum * selectedService.pricePerM2
        setTotalPrice(calculatedPrice)
      } else {
        setTotalPrice(selectedService.basePrice)
      }
    } else {
      setTotalPrice(0)
    }
  }, [selectedService, area])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleOrderClick = () => {
    if (selectedService && area && totalPrice > 0) {
      onOrderClick?.(selectedService, Number.parseFloat(area), totalPrice)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Kalkulator Estimasi Harga</h2>
          <p className="text-xl text-gray-600">Hitung estimasi biaya jasa desain berdasarkan luas bangunan Anda</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Estimasi Biaya Jasa</CardTitle>
            <CardDescription>
              Pilih jenis layanan dan masukkan luas bangunan untuk mendapatkan estimasi harga
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="service">Pilih Jenis Layanan</Label>
              <Select
                onValueChange={(value) => {
                  const service = servicePrices.find((s) => s.id === value)
                  setSelectedService(service || null)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih layanan yang dibutuhkan" />
                </SelectTrigger>
                <SelectContent>
                  {servicePrices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-sm text-gray-500">{service.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Area Input */}
            <div className="space-y-2">
              <Label htmlFor="area">Luas Bangunan (m²)</Label>
              <Input
                id="area"
                type="number"
                placeholder="Masukkan luas bangunan"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                min="1"
              />
              {selectedService && <p className="text-sm text-gray-600">Minimum luas: {selectedService.minArea} m²</p>}
            </div>

            {/* Price Breakdown */}
            {selectedService && area && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Rincian Harga</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Biaya Dasar ({selectedService.name})</span>
                    <span>{formatCurrency(selectedService.basePrice)}</span>
                  </div>
                  {Number.parseFloat(area) > selectedService.minArea && (
                    <div className="flex justify-between">
                      <span>Biaya per m² ({Number.parseFloat(area) - selectedService.minArea} m²)</span>
                      <span>
                        {formatCurrency(
                          (Number.parseFloat(area) - selectedService.minArea) * selectedService.pricePerM2,
                        )}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total Estimasi</span>
                    <span className="text-blue-600">{formatCurrency(totalPrice)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Harga dapat berubah sesuai kompleksitas proyek
                  </Badge>
                </div>
              </div>
            )}

            {/* Order Button */}
            {totalPrice > 0 && (
              <Button onClick={handleOrderClick} size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                Pesan Sekarang - {formatCurrency(totalPrice)}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}

            {/* Info */}
            <div className="text-center text-sm text-gray-600">
              <p>💡 Estimasi harga sudah termasuk revisi minor</p>
              <p>📞 Untuk proyek kompleks, hubungi kami untuk konsultasi gratis</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
