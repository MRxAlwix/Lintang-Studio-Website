"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  ShoppingCart,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Filter,
  MessageCircle,
  TrendingUp,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const stats = [
    {
      title: "Total Klien",
      value: "248",
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Order Aktif",
      value: "23",
      change: "+5%",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Revenue Bulan Ini",
      value: "Rp 45.2M",
      change: "+18%",
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Chat Aktif",
      value: "18",
      change: "+8%",
      icon: MessageCircle,
      color: "text-purple-600",
    },
  ]

  const recentOrders = [
    {
      id: "ORD-001",
      client: "PT. Konstruksi Jaya",
      service: "AutoCAD 2D + RAB",
      status: "In Progress",
      amount: "Rp 2.500.000",
      date: "2024-01-15",
    },
    {
      id: "ORD-002",
      client: "Budi Santoso",
      service: "SketchUp 3D",
      status: "Completed",
      amount: "Rp 1.200.000",
      date: "2024-01-14",
    },
    {
      id: "ORD-003",
      client: "CV. Bangun Indah",
      service: "Plugin AutoCAD",
      status: "Pending",
      amount: "Rp 500.000",
      date: "2024-01-13",
    },
    {
      id: "ORD-004",
      client: "Sari Dewi",
      service: "SketchUp 3D + RAB",
      status: "In Progress",
      amount: "Rp 3.000.000",
      date: "2024-01-12",
    },
  ]

  const plugins = [
    {
      id: "PLG-001",
      name: "AutoCAD Dimension Pro",
      version: "2.1.0",
      downloads: 45,
      price: "Rp 250.000",
      status: "Active",
    },
    {
      id: "PLG-002",
      name: "SketchUp Material Manager",
      version: "1.5.2",
      downloads: 32,
      price: "Rp 300.000",
      status: "Active",
    },
    {
      id: "PLG-003",
      name: "CAD Block Library",
      version: "3.0.1",
      downloads: 78,
      price: "Rp 400.000",
      status: "Active",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Active":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Selamat datang, Abimanyu Lintang Wibowo</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Order
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="plugin-store">Plugin Store</TabsTrigger>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-green-600">{stat.change} dari bulan lalu</p>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Orders */}
            <Card>
              <CardHeader>
                <CardTitle>Order Terbaru</CardTitle>
                <CardDescription>Order yang masuk dalam 7 hari terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Klien</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.client}</TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Semua Orders</CardTitle>
                  <CardDescription>Kelola semua order dari klien</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Order
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Klien</TableHead>
                      <TableHead>Layanan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.client}</TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{order.amount}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plugins" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Plugin Management</CardTitle>
                  <CardDescription>Kelola plugin berbayar untuk AutoCAD dan SketchUp</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Plugin
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plugin ID</TableHead>
                      <TableHead>Nama Plugin</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plugins.map((plugin) => (
                      <TableRow key={plugin.id}>
                        <TableCell className="font-medium">{plugin.id}</TableCell>
                        <TableCell>{plugin.name}</TableCell>
                        <TableCell>{plugin.version}</TableCell>
                        <TableCell>{plugin.downloads}</TableCell>
                        <TableCell>{plugin.price}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(plugin.status)}>{plugin.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Client Management</CardTitle>
                  <CardDescription>Kelola data klien dan riwayat order</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Klien
                </Button>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Client Management</h3>
                  <p className="text-gray-600">Fitur ini akan segera tersedia untuk mengelola data klien.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plugin-store" className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Plugin Store Management</h3>
              <p className="text-gray-600 mb-4">Kelola plugin store dari halaman terpisah</p>
              <Button asChild>
                <Link href="/admin/plugins">
                  <Plus className="w-4 h-4 mr-2" />
                  Buka Plugin Management
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chat Management</h3>
              <p className="text-gray-600 mb-4">Kelola komunikasi dengan klien</p>
              <Button asChild>
                <Link href="/admin/chat">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Buka Chat Management
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Statistics</h3>
              <p className="text-gray-600 mb-4">Analisis mendalam performa bisnis dan revenue</p>
              <Button asChild>
                <Link href="/admin/stats">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Buka Dashboard Statistik
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
