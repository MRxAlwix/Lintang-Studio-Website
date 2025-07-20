"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, MessageCircle, FileText, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface ChatScreeningFormProps {
  roomId: string
  orderId: string
  customerEmail: string
  onComplete: () => void
}

interface ScreeningFormData {
  urgency_level: string
  issue_category: string
  description: string
  expected_response_time: string
}

export function ChatScreeningForm({ roomId, orderId, customerEmail, onComplete }: ChatScreeningFormProps) {
  const [formData, setFormData] = useState<ScreeningFormData>({
    urgency_level: "",
    issue_category: "",
    description: "",
    expected_response_time: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const urgencyLevels = [
    {
      value: "low",
      label: "Rendah",
      description: "Pertanyaan umum, tidak mendesak",
      color: "bg-green-100 text-green-800",
    },
    {
      value: "medium",
      label: "Sedang",
      description: "Butuh klarifikasi proyek",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      value: "high",
      label: "Tinggi",
      description: "Ada masalah dengan hasil kerja",
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "urgent",
      label: "Mendesak",
      description: "Masalah kritis, butuh respon cepat",
      color: "bg-red-100 text-red-800",
    },
  ]

  const issueCategories = [
    { value: "general", label: "Pertanyaan Umum", icon: MessageCircle },
    { value: "technical", label: "Masalah Teknis", icon: AlertCircle },
    { value: "billing", label: "Pembayaran & Tagihan", icon: FileText },
    { value: "revision", label: "Revisi & Perubahan", icon: CheckCircle },
    { value: "timeline", label: "Jadwal & Timeline", icon: Clock },
    { value: "other", label: "Lainnya", icon: MessageCircle },
  ]

  const responseTimeOptions = [
    { value: "asap", label: "Sesegera mungkin" },
    { value: "today", label: "Hari ini" },
    { value: "tomorrow", label: "Besok" },
    { value: "this_week", label: "Minggu ini" },
    { value: "flexible", label: "Fleksibel" },
  ]

  const handleInputChange = (field: keyof ScreeningFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/chat/screening", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          room_id: roomId,
          order_id: orderId,
          customer_email: customerEmail,
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit screening form")
      }

      toast.success("Form berhasil dikirim! Anda akan diarahkan ke chat room.")
      onComplete()
    } catch (error) {
      console.error("Error submitting screening form:", error)
      toast.error("Gagal mengirim form. Silakan coba lagi.")
    } finally {
      setSubmitting(false)
    }
  }

  const selectedUrgency = urgencyLevels.find((u) => u.value === formData.urgency_level)
  const selectedCategory = issueCategories.find((c) => c.value === formData.issue_category)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <span>Screening Chat</span>
          </CardTitle>
          <CardDescription>
            Mohon lengkapi form berikut sebelum memulai chat. Ini membantu kami memberikan respon yang lebih tepat dan
            cepat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Order Info */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Informasi Order</h3>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Order ID:</span>
                  <span className="font-mono ml-2">{orderId}</span>
                </div>
                <div>
                  <span className="text-blue-700">Email:</span>
                  <span className="ml-2">{customerEmail}</span>
                </div>
              </div>
            </div>

            {/* Urgency Level */}
            <div className="space-y-3">
              <Label>Tingkat Urgensi *</Label>
              <div className="grid md:grid-cols-2 gap-3">
                {urgencyLevels.map((urgency) => (
                  <div
                    key={urgency.value}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.urgency_level === urgency.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleInputChange("urgency_level", urgency.value)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{urgency.label}</span>
                      <Badge className={urgency.color}>{urgency.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{urgency.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Issue Category */}
            <div className="space-y-3">
              <Label>Kategori Masalah *</Label>
              <div className="grid md:grid-cols-3 gap-3">
                {issueCategories.map((category) => {
                  const IconComponent = category.icon
                  return (
                    <div
                      key={category.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                        formData.issue_category === category.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => handleInputChange("issue_category", category.value)}
                    >
                      <IconComponent className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Masalah/Pertanyaan *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Jelaskan secara detail masalah atau pertanyaan Anda..."
                rows={4}
                required
              />
              <p className="text-xs text-gray-600">
                Semakin detail informasi yang Anda berikan, semakin cepat kami dapat membantu Anda.
              </p>
            </div>

            {/* Expected Response Time */}
            <div className="space-y-2">
              <Label htmlFor="response_time">Kapan Anda Mengharapkan Respon?</Label>
              <Select
                value={formData.expected_response_time}
                onValueChange={(value) => handleInputChange("expected_response_time", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih waktu respon yang diharapkan" />
                </SelectTrigger>
                <SelectContent>
                  {responseTimeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            {(selectedUrgency || selectedCategory) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Ringkasan</h3>
                <div className="space-y-2 text-sm">
                  {selectedUrgency && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Urgensi:</span>
                      <Badge className={selectedUrgency.color}>{selectedUrgency.label}</Badge>
                    </div>
                  )}
                  {selectedCategory && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600">Kategori:</span>
                      <span className="font-medium">{selectedCategory.label}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Guidelines */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="font-medium text-yellow-900 mb-2">Panduan Chat</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Maksimal 1 pesan per 5 detik untuk mencegah spam</li>
                <li>
                  • Jika mengirim lebih dari 10 pesan berturut-turut tanpa respon admin, chat akan dinonaktifkan
                  sementara
                </li>
                <li>• Gunakan bahasa yang sopan dan profesional</li>
                <li>• Sertakan informasi yang relevan untuk mempercepat penyelesaian</li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={submitting || !formData.urgency_level || !formData.issue_category || !formData.description}
              className="w-full"
            >
              {submitting ? "Memproses..." : "Mulai Chat"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
