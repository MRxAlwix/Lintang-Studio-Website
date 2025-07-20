"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { PromoCodeInput } from "@/components/promo-code-input"
import { ProjectTimeEstimator } from "@/components/project-time-estimator"

interface OrderFormProps {
  selectedService?: {
    id: string
    name: string
    basePrice: number
    pricePerM2: number
    minArea: number
    category: string
    description: string
  }
  selectedArea?: number
  estimatedPrice?: number
  onClose?: () => void
}

interface OrderFormData {
  fullName: string
  email: string
  whatsapp: string
  service: string
  area: string
  notes: string
  files: File[]
}

export function OrderForm({ selectedService, selectedArea, estimatedPrice, onClose }: OrderFormProps) {
  const [formData, setFormData] = useState<OrderFormData>({
    fullName: "",
    email: "",
    whatsapp: "",
    service: selectedService?.id || "",
    area: selectedArea?.toString() || "",
    notes: "",
    files: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)
  const [finalAmount, setFinalAmount] = useState(estimatedPrice || 0)

  const services = [
    { id: "autocad-2d-basic", name: "AutoCAD 2D Basic", price: 300000 },
    { id: "autocad-2d-premium", name: "AutoCAD 2D Premium", price: 500000 },
    { id: "sketchup-3d-basic", name: "SketchUp 3D Basic", price: 400000 },
    { id: "sketchup-3d-premium", name: "SketchUp 3D Premium", price: 750000 },
    { id: "rab-sederhana", name: "RAB Sederhana", price: 250000 },
    { id: "rab-lengkap", name: "RAB Lengkap", price: 400000 },
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files)
      setFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }))
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }))
    }
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const handlePromoApplied = (promoData: any) => {
    setAppliedPromo(promoData)
    setFinalAmount(promoData.final_amount)
  }

  const handlePromoRemoved = () => {
    setAppliedPromo(null)
    setFinalAmount(estimatedPrice || 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append("fullName", formData.fullName)
      submitData.append("email", formData.email)
      submitData.append("whatsapp", formData.whatsapp)
      submitData.append("service", formData.service)
      submitData.append("area", formData.area)
      submitData.append("notes", formData.notes)
      submitData.append("estimatedPrice", estimatedPrice?.toString() || "0")

      // Tambahkan setelah submitData.append("estimatedPrice", estimatedPrice?.toString() || "0")
      if (appliedPromo) {
        submitData.append("promoCode", appliedPromo.promo_code || "")
        submitData.append("discountAmount", appliedPromo.discount_amount?.toString() || "0")
        submitData.append("finalAmount", finalAmount.toString())
      }

      // Append files
      formData.files.forEach((file, index) => {
        submitData.append(`file_${index}`, file)
      })

      // Submit to API
      const response = await fetch("/api/orders/create", {
        method: "POST",
        body: submitData,
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const result = await response.json()

      // Redirect to payment
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        toast.success("Order berhasil dibuat! Anda akan dihubungi segera.")
        onClose?.()
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error("Gagal membuat order. Silakan coba lagi.")
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
              <CardTitle className="text-2xl">Form Pemesanan Jasa</CardTitle>
              <CardDescription>Lengkapi data berikut untuk memproses pesanan Anda</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informasi Pribadi</h3>

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
            </div>

            {/* Project Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informasi Proyek</h3>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Jenis Layanan *</Label>
                  <Select value={formData.service} onValueChange={(value) => handleInputChange("service", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih layanan" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Luas Bangunan (m²) *</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.area}
                    onChange={(e) => handleInputChange("area", e.target.value)}
                    placeholder="Contoh: 120"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Catatan Tambahan</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Jelaskan detail proyek, kebutuhan khusus, atau pertanyaan lainnya..."
                  rows={4}
                />
              </div>
            </div>

            {/* Project Time Estimation */}
            {formData.service && formData.area && (
              <ProjectTimeEstimator
                serviceCategory={formData.service.split("-")[0]} // Extract category from service ID
                area={Number.parseFloat(formData.area)}
                className="mt-4"
              />
            )}

            {/* File Upload */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Upload File (Opsional)</h3>
              <p className="text-sm text-gray-600">
                Upload sketsa, denah existing, atau referensi lainnya (Max 10MB per file)
              </p>

              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">
                  Drag & drop file di sini atau{" "}
                  <label className="text-blue-600 cursor-pointer hover:underline">
                    pilih file
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.dwg,.skp"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">Format: PDF, JPG, PNG, DWG, SKP</p>
              </div>

              {/* File List */}
              {formData.files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">File yang diupload:</h4>
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </Badge>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Promo Code */}
            <PromoCodeInput
              amount={estimatedPrice || 0}
              type="services"
              onPromoApplied={handlePromoApplied}
              onPromoRemoved={handlePromoRemoved}
            />

            {/* Price Summary */}
            {estimatedPrice && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(estimatedPrice)}</span>
                  </div>

                  {appliedPromo && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Diskon ({appliedPromo.promo_name}):</span>
                      <span>-{formatCurrency(appliedPromo.discount_amount)}</span>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Akhir:</span>
                      <span className="text-xl font-bold text-blue-600">{formatCurrency(finalAmount)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">Harga final akan dikonfirmasi setelah review detail proyek</p>
              </div>
            )}

            {/* Submit Button */}
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
                    Lanjut ke Pembayaran
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
