"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Plus, Edit, Trash2, Upload, Eye, FileText } from "lucide-react"
import { toast } from "sonner"

interface Plugin {
  id: string
  name: string
  description: string
  version: string
  price: number
  category: "autocad" | "sketchup"
  download_count: number
  rating: number
  file_url: string
  features: string[]
  is_active: boolean
  created_at: string
}

interface PluginFormData {
  name: string
  description: string
  version: string
  price: string
  category: "autocad" | "sketchup"
  features: string
  file: File | null
}

export default function AdminPluginsPage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPlugin, setEditingPlugin] = useState<Plugin | null>(null)
  const [formData, setFormData] = useState<PluginFormData>({
    name: "",
    description: "",
    version: "",
    price: "",
    category: "autocad",
    features: "",
    file: null,
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchPlugins()
  }, [])

  const fetchPlugins = async () => {
    try {
      const response = await fetch("/api/admin/plugins")
      if (response.ok) {
        const data = await response.json()
        setPlugins(data)
      }
    } catch (error) {
      console.error("Error fetching plugins:", error)
      toast.error("Gagal memuat plugin")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      version: "",
      price: "",
      category: "autocad",
      features: "",
      file: null,
    })
    setEditingPlugin(null)
  }

  const handleInputChange = (field: keyof PluginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("description", formData.description)
      submitData.append("version", formData.version)
      submitData.append("price", formData.price)
      submitData.append("category", formData.category)
      submitData.append("features", formData.features)

      if (formData.file) {
        submitData.append("file", formData.file)
      }

      const url = editingPlugin ? `/api/admin/plugins/${editingPlugin.id}` : "/api/admin/plugins"
      const method = editingPlugin ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: submitData,
      })

      if (!response.ok) {
        throw new Error("Failed to save plugin")
      }

      toast.success(editingPlugin ? "Plugin berhasil diupdate" : "Plugin berhasil ditambahkan")
      fetchPlugins()
      setShowAddModal(false)
      resetForm()
    } catch (error) {
      console.error("Error saving plugin:", error)
      toast.error("Gagal menyimpan plugin")
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (plugin: Plugin) => {
    setEditingPlugin(plugin)
    setFormData({
      name: plugin.name,
      description: plugin.description,
      version: plugin.version,
      price: plugin.price.toString(),
      category: plugin.category,
      features: plugin.features.join("\n"),
      file: null,
    })
    setShowAddModal(true)
  }

  const handleDelete = async (pluginId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus plugin ini?")) return

    try {
      const response = await fetch(`/api/admin/plugins/${pluginId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete plugin")
      }

      toast.success("Plugin berhasil dihapus")
      fetchPlugins()
    } catch (error) {
      console.error("Error deleting plugin:", error)
      toast.error("Gagal menghapus plugin")
    }
  }

  const toggleStatus = async (pluginId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/plugins/${pluginId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (!response.ok) {
        throw new Error("Failed to toggle status")
      }

      toast.success("Status plugin berhasil diubah")
      fetchPlugins()
    } catch (error) {
      console.error("Error toggling status:", error)
      toast.error("Gagal mengubah status plugin")
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat plugin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plugin Management</h1>
          <p className="text-gray-600">Kelola plugin premium untuk AutoCAD dan SketchUp</p>
        </div>
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Plugin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlugin ? "Edit Plugin" : "Tambah Plugin Baru"}</DialogTitle>
              <DialogDescription>
                {editingPlugin ? "Update informasi plugin" : "Upload plugin baru ke store"}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Plugin *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Contoh: AutoCAD Dimension Pro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="version">Version *</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => handleInputChange("version", e.target.value)}
                    placeholder="Contoh: 2.1.0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Jelaskan fungsi dan kegunaan plugin..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: "autocad" | "sketchup") => handleInputChange("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="autocad">AutoCAD</SelectItem>
                      <SelectItem value="sketchup">SketchUp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Harga (IDR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="250000"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="features">Fitur (satu per baris) *</Label>
                <Textarea
                  id="features"
                  value={formData.features}
                  onChange={(e) => handleInputChange("features", e.target.value)}
                  placeholder="Auto Dimensioning&#10;Smart Blocks&#10;Batch Processing&#10;Custom Tools"
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">File Plugin (.zip, .lsp) {editingPlugin ? "(Opsional)" : "*"}</Label>
                <Input id="file" type="file" accept=".zip,.lsp" onChange={handleFileChange} required={!editingPlugin} />
                <p className="text-sm text-gray-600">Upload file plugin dalam format ZIP atau LSP (Max 50MB)</p>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-transparent"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={uploading} className="flex-1">
                  {uploading ? (
                    "Mengupload..."
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      {editingPlugin ? "Update Plugin" : "Upload Plugin"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plugins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Plugin</CardTitle>
          <CardDescription>Total: {plugins.length} plugin</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plugin</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plugins.map((plugin) => (
                <TableRow key={plugin.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plugin.name}</div>
                      <div className="text-sm text-gray-600">v{plugin.version}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={plugin.category === "autocad" ? "default" : "secondary"}
                      className={plugin.category === "autocad" ? "bg-blue-600" : "bg-green-600"}
                    >
                      {plugin.category === "autocad" ? "AutoCAD" : "SketchUp"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(plugin.price)}</TableCell>
                  <TableCell>{plugin.download_count}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleStatus(plugin.id, plugin.is_active)}
                      className={plugin.is_active ? "text-green-600" : "text-red-600"}
                    >
                      <Badge className={plugin.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {plugin.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" title="Lihat Detail">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(plugin)} title="Edit">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(plugin.id)}
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

          {plugins.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada plugin</h3>
              <p className="text-gray-600">Mulai dengan menambahkan plugin pertama Anda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
