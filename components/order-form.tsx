"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import { ValidatedInput, useFormValidation, validationRules } from "./form-validation"
import { PromoCodeInput } from "./promo-code-input"
import { ProjectTimeEstimator } from "./project-time-estimator"
import { Loader2, Calculator, Clock, Tag } from "lucide-react"

interface Service {
  id: string
  name: string
  description: string
  base_price: number
  category: string
  is_active: boolean
}

interface OrderFormProps {
  services: Service[]
}

interface OrderFormData {
  name: string
  email: string
  phone: string
  service_id: string
  description: string
  budget_min: string
  budget_max: string
  deadline: string
}

const validationSchema = {
  name: validationRules.name,
  email: validationRules.email,
  phone: validationRules.phone,
  service_id: validationRules.required,
  description: { ...validationRules.text, minLength: 10 },
  budget_min: validationRules.required,
  budget_max: validationRules.required,
  deadline: validationRules.required,
}

export function OrderForm({ services }: OrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null)

  const { values, errors, touched, setValue, setFieldTouched, validateAll, reset } = useFormValidation<OrderFormData>(
    {
      name: "",
      email: "",
      phone: "",
      service_id: "",
      description: "",
      budget_min: "",
      budget_max: "",
      deadline: "",
    },
    validationSchema,
  )

  const handleServiceChange = (serviceId: string) => {
    setValue("service_id", serviceId)
    const service = services.find((s) => s.id === serviceId)
    setSelectedService(service || null)

    if (service) {
      setValue("budget_min", service.base_price.toString())
      setValue("budget_max", (service.base_price * 1.5).toString())
    }
  }

  const calculateTotal = () => {
    const budgetMin = Number.parseFloat(values.budget_min) || 0
    const discount = (budgetMin * promoDiscount) / 100
    return Math.max(0, budgetMin - discount)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateAll()) {
      toast({
        title: "Form tidak valid",
        description: "Mohon periksa kembali data yang Anda masukkan",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const orderData = {
        ...values,
        budget_min: Number.parseFloat(values.budget_min),
        budget_max: Number.parseFloat(values.budget_max),
        promo_code: promoCode || null,
        estimated_time: estimatedTime,
        total_amount: calculateTotal(),
      }

      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Gagal membuat pesanan")
      }

      // Redirect to payment
      if (result.payment_url) {
        window.location.href = result.payment_url
      } else {
        toast({
          title: "Pesanan berhasil dibuat",
          description: "Kami akan segera menghubungi Anda",
        })
        reset()
        setPromoCode("")
        setPromoDiscount(0)
        setSelectedService(null)
        setEstimatedTime(null)
      }
    } catch (error) {
      console.error("Order submission error:", error)
      toast({
        title: "Gagal membuat pesanan",
        description: error instanceof Error ? error.message : "Terjadi kesalahan sistem",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Form Pemesanan Jasa
          </CardTitle>
          <CardDescription>Isi form di bawah untuk memesan jasa dari Lintang Studio</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput
                id="name"
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap Anda"
                value={values.name}
                onChange={(value) => setValue("name", value)}
                rules={validationRules.name}
              />

              <ValidatedInput
                id="email"
                label="Email"
                type="email"
                placeholder="nama@email.com"
                value={values.email}
                onChange={(value) => setValue("email", value)}
                rules={validationRules.email}
              />
            </div>

            <ValidatedInput
              id="phone"
              label="Nomor WhatsApp"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={values.phone}
              onChange={(value) => setValue("phone", value)}
              rules={validationRules.phone}
            />

            {/* Service Selection */}
            <div className="space-y-2">
              <Label htmlFor="service">
                Pilih Layanan <span className="text-red-500">*</span>
              </Label>
              <Select value={values.service_id} onValueChange={handleServiceChange}>
                <SelectTrigger className={errors.service_id && touched.service_id ? "border-red-500" : ""}>
                  <SelectValue placeholder="Pilih layanan yang diinginkan" />
                </SelectTrigger>
                <SelectContent>
                  {services
                    .filter((s) => s.is_active)
                    .map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{service.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Mulai dari Rp {service.base_price.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.service_id && touched.service_id && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.service_id}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Selected Service Info */}
            {selectedService && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{selectedService.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{selectedService.description}</p>
                      <Badge variant="secondary" className="mt-2">
                        {selectedService.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Harga mulai dari</p>
                      <p className="text-lg font-semibold">Rp {selectedService.base_price.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Project Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Deskripsi Proyek <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Jelaskan detail proyek Anda, fitur yang diinginkan, referensi, dll."
                value={values.description}
                onChange={(e) => setValue("description", e.target.value)}
                onBlur={() => setFieldTouched("description")}
                className={`min-h-[120px] ${errors.description && touched.description ? "border-red-500" : ""}`}
              />
              {errors.description && touched.description && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.description}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Budget Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_min">
                  Budget Minimum <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budget_min"
                  type="number"
                  placeholder="1000000"
                  value={values.budget_min}
                  onChange={(e) => setValue("budget_min", e.target.value)}
                  onBlur={() => setFieldTouched("budget_min")}
                  className={errors.budget_min && touched.budget_min ? "border-red-500" : ""}
                />
                {errors.budget_min && touched.budget_min && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.budget_min}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_max">
                  Budget Maksimum <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="budget_max"
                  type="number"
                  placeholder="5000000"
                  value={values.budget_max}
                  onChange={(e) => setValue("budget_max", e.target.value)}
                  onBlur={() => setFieldTouched("budget_max")}
                  className={errors.budget_max && touched.budget_max ? "border-red-500" : ""}
                />
                {errors.budget_max && touched.budget_max && (
                  <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-sm">{errors.budget_max}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">
                Deadline <span className="text-red-500">*</span>
              </Label>
              <Input
                id="deadline"
                type="date"
                value={values.deadline}
                onChange={(e) => setValue("deadline", e.target.value)}
                onBlur={() => setFieldTouched("deadline")}
                min={new Date().toISOString().split("T")[0]}
                className={errors.deadline && touched.deadline ? "border-red-500" : ""}
              />
              {errors.deadline && touched.deadline && (
                <Alert variant="destructive" className="py-2">
                  <AlertDescription className="text-sm">{errors.deadline}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Project Time Estimator */}
            {selectedService && values.description && (
              <div className="space-y-4">
                <Separator />
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <h4 className="font-medium">Estimasi Waktu Pengerjaan</h4>
                </div>
                <ProjectTimeEstimator
                  serviceType={selectedService.category}
                  description={values.description}
                  onEstimateChange={setEstimatedTime}
                />
              </div>
            )}

            {/* Promo Code */}
            <div className="space-y-4">
              <Separator />
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <h4 className="font-medium">Kode Promo (Opsional)</h4>
              </div>
              <PromoCodeInput
                value={promoCode}
                onChange={setPromoCode}
                onDiscountChange={setPromoDiscount}
                orderAmount={Number.parseFloat(values.budget_min) || 0}
              />
            </div>

            {/* Order Summary */}
            {values.budget_min && (
              <Card className="bg-primary/5">
                <CardContent className="pt-4">
                  <h4 className="font-medium mb-3">Ringkasan Pesanan</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp {Number.parseFloat(values.budget_min).toLocaleString("id-ID")}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Diskon ({promoDiscount}%)</span>
                        <span>
                          -Rp {((Number.parseFloat(values.budget_min) * promoDiscount) / 100).toLocaleString("id-ID")}
                        </span>
                      </div>
                    )}
                    {estimatedTime && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Estimasi waktu</span>
                        <span>{estimatedTime} hari kerja</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>Rp {calculateTotal().toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses Pesanan...
                </>
              ) : (
                "Buat Pesanan & Lanjut ke Pembayaran"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
