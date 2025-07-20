"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, DollarSign, ShoppingCart, Users, Download, Calendar, RefreshCw } from "lucide-react"

interface StatsData {
  totalRevenue: number
  serviceRevenue: number
  pluginRevenue: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalClients: number
  activeClients: number
  topClients: Array<{
    name: string
    email: string
    totalSpent: number
    orderCount: number
  }>
  popularPlugins: Array<{
    name: string
    downloads: number
    revenue: number
  }>
  dailyRevenue: Array<{
    date: string
    service: number
    plugin: number
    total: number
  }>
  weeklyOrders: Array<{
    week: string
    orders: number
    completed: number
  }>
  monthlyTrends: Array<{
    month: string
    revenue: number
    orders: number
    clients: number
  }>
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("7d")
  const [activeTab, setActiveTab] = useState("overview")

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
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("id-ID").format(num)
  }

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0
    return ((current - previous) / previous) * 100
  }

  const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading statistics...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data Available</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Unable to load statistics</p>
          <Button onClick={fetchStats}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Statistics</h1>
              <p className="text-gray-600 dark:text-gray-400">Comprehensive business analytics and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                  <SelectItem value="1y">1 Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchStats}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="plugins">Plugins</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(stats.totalRevenue)}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">+18% from last period</span>
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(stats.totalOrders)}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">+12% from last period</span>
                      </div>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Clients</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(stats.activeClients)}
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">+8% from last period</span>
                      </div>
                    </div>
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {((stats.completedOrders / stats.totalOrders) * 100).toFixed(1)}%
                      </p>
                      <div className="flex items-center mt-1">
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                        <span className="text-sm text-green-600">+5% from last period</span>
                      </div>
                    </div>
                    <Calendar className="w-8 h-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Distribution</CardTitle>
                  <CardDescription>Service vs Plugin revenue breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Services", value: stats.serviceRevenue, color: COLORS[0] },
                          { name: "Plugins", value: stats.pluginRevenue, color: COLORS[1] },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: "Services", value: stats.serviceRevenue },
                          { name: "Plugins", value: stats.pluginRevenue },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue Trend</CardTitle>
                  <CardDescription>Revenue performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={stats.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stackId="1"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Revenue Breakdown</CardTitle>
                  <CardDescription>Service and plugin revenue by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="service" stackId="a" fill="#2563eb" name="Services" />
                      <Bar dataKey="plugin" stackId="a" fill="#10b981" name="Plugins" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>Revenue trends over months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={stats.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={3}
                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Service Revenue</p>
                    <p className="text-3xl font-bold text-blue-600 mt-2">{formatCurrency(stats.serviceRevenue)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {((stats.serviceRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plugin Revenue</p>
                    <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(stats.pluginRevenue)}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {((stats.pluginRevenue / stats.totalRevenue) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Order Value</p>
                    <p className="text-3xl font-bold text-purple-600 mt-2">
                      {formatCurrency(stats.totalRevenue / stats.totalOrders)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Per transaction</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Orders</CardTitle>
                  <CardDescription>Order volume and completion rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.weeklyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#2563eb" name="Total Orders" />
                      <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current order status breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Completed", value: stats.completedOrders, color: COLORS[1] },
                          { name: "Pending", value: stats.pendingOrders, color: COLORS[2] },
                          {
                            name: "In Progress",
                            value: stats.totalOrders - stats.completedOrders - stats.pendingOrders,
                            color: COLORS[0],
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          { name: "Completed", value: stats.completedOrders },
                          { name: "Pending", value: stats.pendingOrders },
                          {
                            name: "In Progress",
                            value: stats.totalOrders - stats.completedOrders - stats.pendingOrders,
                          },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {formatNumber(stats.totalOrders)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{formatNumber(stats.completedOrders)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{formatNumber(stats.pendingOrders)}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {formatNumber(stats.totalOrders - stats.completedOrders - stats.pendingOrders)}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Clients by Spending</CardTitle>
                  <CardDescription>Highest value customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.topClients.map((client, index) => (
                      <div
                        key={client.email}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{client.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(client.totalSpent)}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{client.orderCount} orders</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Growth</CardTitle>
                  <CardDescription>New vs returning clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(stats.totalClients)}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400">Total Clients</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{formatNumber(stats.activeClients)}</p>
                        <p className="text-sm text-green-700 dark:text-green-400">Active Clients</p>
                      </div>

                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {((stats.activeClients / stats.totalClients) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-blue-700 dark:text-blue-400">Activity Rate</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="plugins" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Popular Plugins</CardTitle>
                  <CardDescription>Most downloaded and highest revenue plugins</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.popularPlugins.map((plugin, index) => (
                      <div
                        key={plugin.name}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{plugin.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatNumber(plugin.downloads)} downloads
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{formatCurrency(plugin.revenue)}</p>
                          <Badge variant="outline" className="mt-1">
                            Revenue
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Plugin Performance</CardTitle>
                  <CardDescription>Download vs revenue correlation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={stats.popularPlugins}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis yAxisId="left" orientation="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="downloads" fill="#2563eb" name="Downloads" />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (IDR)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
