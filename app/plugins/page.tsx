"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { PluginPurchaseModal } from "@/components/plugin-purchase-modal"
import { Download, Search, Filter, Star, Users, ShoppingCart, Lock } from "lucide-react"
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
  preview_images: string[]
  features: string[]
  is_active: boolean
  created_at: string
}

export default function PluginStorePage() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [filteredPlugins, setFilteredPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState("created_at")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [userPurchases, setUserPurchases] = useState<string[]>([])

  const fetchPlugins = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        category: categoryFilter,
        sortBy,
        sortOrder,
        limit: "20",
        offset: "0",
      })

      const response = await fetch(`/api/plugins/search?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPlugins(data.plugins || [])
        setFilteredPlugins(data.plugins || [])
      }
    } catch (error) {
      console.error("Error fetching plugins:", error)
      toast.error("Gagal memuat plugin")
    } finally {
      setLoading(false)
    }
  }, [searchTerm, categoryFilter, sortBy, sortOrder])

  const fetchUserPurchases = async () => {
    try {
      const response = await fetch("/api/plugins/purchases")
      if (response.ok) {
        const data = await response.json()
        setUserPurchases(data.map((p: any) => p.plugin_id))
      }
    } catch (error) {
      console.error("Error fetching user purchases:", error)
    }
  }

  useEffect(() => {
    fetchPlugins()
    fetchUserPurchases()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPlugins()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [fetchPlugins])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handlePurchase = (plugin: Plugin) => {
    setSelectedPlugin(plugin)
    setShowPurchaseModal(true)
  }

  const handleDownload = async (plugin: Plugin) => {
    if (!userPurchases.includes(plugin.id)) {
      toast.error("Anda belum membeli plugin ini")
      return
    }

    try {
      const response = await fetch(`/api/plugins/${plugin.id}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${plugin.name}-v${plugin.version}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success("Plugin berhasil didownload")
      } else {
        toast.error("Gagal mendownload plugin")
      }
    } catch (error) {
      console.error("Download error:", error)
      toast.error("Gagal mendownload plugin")
    }
  }

  const isPurchased = (pluginId: string) => userPurchases.includes(pluginId)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat plugin...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Plugin Store</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Tingkatkan produktivitas AutoCAD dan SketchUp Anda dengan plugin premium dari Lintang Studio
            </p>
            <div className="flex justify-center space-x-8 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold">{plugins.length}+</div>
                <div className="text-blue-200">Plugin Tersedia</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">1000+</div>
                <div className="text-blue-200">Download</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">4.8</div>
                <div className="text-blue-200">Rating Rata-rata</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cari plugin..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  <SelectItem value="autocad">AutoCAD</SelectItem>
                  <SelectItem value="sketchup">SketchUp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Plugin Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredPlugins.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <ShoppingCart className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Tidak ada plugin ditemukan</h3>
              <p className="text-gray-600">Coba ubah filter pencarian Anda</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPlugins.map((plugin) => (
                <Card key={plugin.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge
                        variant={plugin.category === "autocad" ? "default" : "secondary"}
                        className={plugin.category === "autocad" ? "bg-blue-600" : "bg-green-600"}
                      >
                        {plugin.category === "autocad" ? "AutoCAD" : "SketchUp"}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">{plugin.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plugin.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-600">v{plugin.version}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{plugin.description}</p>

                    {/* Features */}
                    {plugin.features && plugin.features.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Fitur Utama:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {plugin.features.slice(0, 3).map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{plugin.download_count} downloads</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>Active users</span>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl font-bold text-blue-600">{formatCurrency(plugin.price)}</div>
                        {isPurchased(plugin.id) && <Badge className="bg-green-100 text-green-800">Sudah Dibeli</Badge>}
                      </div>

                      <div className="flex space-x-2">
                        {isPurchased(plugin.id) ? (
                          <Button
                            onClick={() => handleDownload(plugin)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handlePurchase(plugin)}
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Beli Sekarang
                            </Button>
                            <Button
                              variant="outline"
                              disabled
                              className="px-3 bg-transparent"
                              title="Beli plugin untuk download"
                            >
                              <Lock className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Purchase Modal */}
      {showPurchaseModal && selectedPlugin && (
        <PluginPurchaseModal
          plugin={selectedPlugin}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedPlugin(null)
          }}
          onSuccess={() => {
            fetchUserPurchases()
            setShowPurchaseModal(false)
            setSelectedPlugin(null)
          }}
        />
      )}
    </div>
  )
}
