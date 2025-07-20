"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { DollarSign, ShoppingCart, Users, Download, Calendar, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface StatsData {
  summary: {
    totalRevenue: number
    serviceRevenue: number
    pluginRevenue: number
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalPluginSales: number
  }
  topClients: Array<{
    name: string
    email: string
    totalSpent: number
    orderCount: number
  }>
  chartData: Array<{
    date: string
    revenue: number
    orders: number
    plugins: number
  }>
  period: string
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")

  useEffect(() => {
    fetchStats()
  }, [period])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/stats?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        toast.error("Gagal memuat statistik")
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      toast.error("Gagal memuat statistik")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
    })
  }

  const pieData = stats
    ? [
        { name: "Jasa Desain", value: stats.summary.serviceRevenue, color: "#3B82F6" },
        { name: "Plugin", value: stats.summary.pluginRevenue, color: "#10B981" },
      ]
    : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat statistik...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Gagal memuat data statistik</p>
        <Button onClick={fetchStats} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistik & Analytics</h1>
          <p className="text-gray-600">Dashboard ringkasan performa bisnis</p>
        </div>
        <div className="flex space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">24 Jam Terakhir</SelectItem>
              <SelectItem value="week">7 Hari Terakhir</SelectItem>
              <SelectItem value="month">Bulan Ini</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.summary.totalRevenue)}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    Jasa: {formatCurrency(stats.summary.serviceRevenue)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Plugin: {formatCurrency(stats.summary.pluginRevenue)}
                  </Badge>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary.totalOrders}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className="bg-blue-100 text-blue-800 text-xs">Selesai: {stats.summary.completedOrders}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                    Pending: {stats.summary.pendingOrders}
                  </Badge>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plugin Terjual</p>
                <p className="text-2xl font-bold text-gray-900">{stats.summary.totalPluginSales}</p>
                <p className="text-sm text-green-600">Revenue: {formatCurrency(stats.summary.pluginRevenue)}</p>
              </div>
              <Download className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.topClients.length}</p>
                <p className="text-sm text-gray-600">Klien aktif periode ini</p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Grafik Revenue Harian</CardTitle>
            <CardDescription>Pendapatan per hari dalam periode {period}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} fontSize={12} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                  labelFormatter={(label) => `Tanggal: ${formatDate(label)}`}
                />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Revenue</CardTitle>
            <CardDescription>Perbandingan pendapatan jasa vs plugin</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients</CardTitle>
          <CardDescription>Klien dengan spending tertinggi periode ini</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topClients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Spending</TableHead>
                  <TableHead>Avg per Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topClients.map((client, index) => (
                  <TableRow key={client.email}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{client.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{client.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.orderCount} orders</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(client.totalSpent)}</TableCell>
                    <TableCell className="text-gray-600">
                      {formatCurrency(client.totalSpent / client.orderCount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Belum ada data client untuk periode ini</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Orders & Plugins Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Aktivitas Harian</CardTitle>
          <CardDescription>Jumlah order dan plugin terjual per hari</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip labelFormatter={(label) => `Tanggal: ${formatDate(label)}`} />
              <Line type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
              <Line type="monotone" dataKey="plugins" stroke="#10B981" strokeWidth={2} name="Plugin Sales" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
