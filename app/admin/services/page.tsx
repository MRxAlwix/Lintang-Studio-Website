"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Settings, DollarSign, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface Service {
  id: string
  name: string
  description: string
  base_price: number
  price_per_m2: number
  min_area: number
  complexity_factor: number
  category: string
  features: string[]
  is_active: boolean
  created_at: string
}

interface ServiceFormData {
  name: string
  description: string
  base_price: string
  price_per_m2: string
  min_area: string
  complexity_factor: string
  category: string
  features: string
  is_active: boolean
}

export default function ServicesManagementPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    description: "",
    base_price: "",
    price_per_m2: "",
    min_area: "36",
    complexity_factor: "1.0",
    category: "autocad",
    features: "",
    is_active: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services")
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      toast.error("Gagal memuat layanan")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      base_price: "",
      price_per_m2: "",
      min_area: "36",
      complexity_factor: "1.0",
      category: "autocad",
      features: "",
      is_active: true,
    })
    setEditingService(null)
  }

  const handleInputChange = (field: keyof ServiceFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const submitData = {
        ...formData,
        base_price: Number.parseFloat(formData.base_price),
        price_per_m2: Number.parseFloat(formData.price_per_m2),
        min_area: Number.parseFloat(formData.min_area),
        complexity_factor: Number.parseFloat(formData.complexity_factor),
        features: formData.features.split("\n").filter((f) => f.trim()),
      }

      const url = editingService ? `/api/admin/services/${editingService.id}` : "/api/admin/services"
      const method = editingService ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        throw new Error("Failed to save service")
      }

      toast.success(editingService ? "Layanan berhasil diupdate" : "Layanan berhasil ditambahkan")
      fetchServices()
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving service:", error)
      toast.error("Gagal menyimpan layanan")
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      base_price: service.base_price.toString(),
      price_per_m2: service.price_per_m2.toString(),
      min_area: service.min_area.toString(),
      complexity_factor: service.complexity_factor.toString(),
      category: service.category,
      features: service.features.join("\n"),
      is_active: service.is_active,
    })
    setShowAddModal(true)
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus layanan ini?")) return

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete service")
      }

      toast.success("Layanan berhasil dihapus")
      fetchServices()
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Gagal menghapus layanan")
    }
  }

  const toggleStatus = async (serviceId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/services/${serviceId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle status")
      }

      toast.success("Status layanan berhasil diubah")
      fetchServices()
    } catch (error) {
      console.error("Error toggling status:", error)
      toast.error("Gagal mengubah status layanan")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculatePrice = (basePrice: number, pricePerM2: number, area: number, complexityFactor: number) => {
    const totalPrice = (basePrice + area * pricePerM2) * complexityFactor
    return totalPrice
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat layanan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Layanan</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Layanan Aktif</p>
                <p className="text-2xl font-bold text-gray-900">{services.filter((s) => s.is_active).length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Harga Rata-rata</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(services.reduce((acc, s) => acc + s.base_price, 0) / (services.length || 1))}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manajemen Layanan Jasa</CardTitle>
            <CardDescription>Kelola harga, kompleksitas, dan status layanan</CardDescription>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Layanan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingService ? "Edit Layanan" : "Tambah Layanan Baru"}</DialogTitle>
                <DialogDescription>
                  {editingService ? "Update informasi layanan" : "Buat layanan jasa baru"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Layanan *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="AutoCAD 2D Premium"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori *</Label>
                    <select
                      id="category"
                      value={formData.category}
                      onChange={(e) => handleInputChange("category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                    >
                      <option value="autocad">AutoCAD</option>
                      <option value="sketchup">SketchUp</option>
                      <option value="rab">RAB</option>
                      <option value="plugin">Plugin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Deskripsi lengkap layanan..."
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="base_price">Harga Dasar (IDR) *</Label>
                    <Input
                      id="base_price"
                      type="number"
                      value={formData.base_price}
                      onChange={(e) => handleInputChange("base_price", e.target.value)}
                      placeholder="500000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price_per_m2">Harga per m² (IDR) *</Label>
                    <Input
                      id="price_per_m2"
                      type="number"
                      value={formData.price_per_m2}
                      onChange={(e) => handleInputChange("price_per_m2", e.target.value)}
                      placeholder="15000"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_area">Luas Minimum (m²) *</Label>
                    <Input
                      id="min_area"
                      type="number"
                      value={formData.min_area}
                      onChange={(e) => handleInputChange("min_area", e.target.value)}
                      placeholder="36"
                      min="1"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complexity_factor">Faktor Kompleksitas *</Label>
                    <Input
                      id="complexity_factor"
                      type="number"
                      step="0.1"
                      value={formData.complexity_factor}
                      onChange={(e) => handleInputChange("complexity_factor", e.target.value)}
                      placeholder="1.0"
                      min="0.1"
                      max="5.0"
                      required
                    />
                    <p className="text-xs text-gray-600">1.0 = normal, 1.5 = kompleks, 2.0 = sangat kompleks</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Fitur (satu per baris) *</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => handleInputChange("features", e.target.value)}
                    placeholder="Denah Bangunan&#10;Tampak Depan/Belakang&#10;Potongan&#10;Detail Konstruksi"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  />
                  <Label htmlFor="is_active">Layanan Aktif</Label>
                </div>

                {/* Price Preview */}
                {formData.base_price && formData.price_per_m2 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Preview Harga:</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p>
                        Rumah 100m²:{" "}
                        {formatCurrency(
                          calculatePrice(
                            Number.parseFloat(formData.base_price),
                            Number.parseFloat(formData.price_per_m2),
                            100,
                            Number.parseFloat(formData.complexity_factor),
                          ),
                        )}
                      </p>
                      <p>
                        Rumah 200m²:{" "}
                        {formatCurrency(
                          calculatePrice(
                            Number.parseFloat(formData.base_price),
                            Number.parseFloat(formData.price_per_m2),
                            200,
                            Number.parseFloat(formData.complexity_factor),
                          ),
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 bg-transparent"
                  >
                    Batal
                  </Button>
                  <Button type="submit" disabled={saving} className="flex-1">
                    {saving ? "Menyimpan..." : editingService ? "Update Layanan" : "Tambah Layanan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Layanan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga Dasar</TableHead>
                <TableHead>Per m²</TableHead>
                <TableHead>Kompleksitas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">{service.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        service.category === "autocad"
                          ? "default"
                          : service.category === "sketchup"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {service.category.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(service.base_price)}</TableCell>
                  <TableCell>{formatCurrency(service.price_per_m2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.complexity_factor}x</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(service.id, service.is_active)}
                      className={service.is_active ? "text-green-600" : "text-red-600"}
                    >
                      <Badge className={service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {service.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(service)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {services.length === 0 && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada layanan</h3>
              <p className="text-gray-600">Mulai dengan menambahkan layanan pertama Anda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
