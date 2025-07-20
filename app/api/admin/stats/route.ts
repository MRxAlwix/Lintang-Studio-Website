import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get total revenue from orders and plugin purchases
    const { data: orderRevenue } = await supabase
      .from("orders")
      .select("amount")
      .eq("status", "paid")
      .gte("created_at", startDate.toISOString())

    const { data: pluginRevenue } = await supabase
      .from("plugin_purchases")
      .select("amount")
      .eq("status", "paid")
      .gte("created_at", startDate.toISOString())

    const serviceRevenue = orderRevenue?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
    const pluginRevenueTotal = pluginRevenue?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0
    const totalRevenue = serviceRevenue + pluginRevenueTotal

    // Get order statistics
    const { data: orders } = await supabase
      .from("orders")
      .select("status, created_at")
      .gte("created_at", startDate.toISOString())

    const totalOrders = orders?.length || 0
    const pendingOrders = orders?.filter((order) => order.status === "pending").length || 0
    const completedOrders = orders?.filter((order) => order.status === "completed").length || 0

    // Get client statistics
    const { data: clients } = await supabase
      .from("orders")
      .select("customer_email, customer_name, amount, created_at")
      .eq("status", "paid")
      .gte("created_at", startDate.toISOString())

    const uniqueClients = new Set(clients?.map((order) => order.customer_email) || [])
    const totalClients = uniqueClients.size
    const activeClients = totalClients // For now, all clients with orders are considered active

    // Get top clients
    const clientSpending = new Map()
    clients?.forEach((order) => {
      const email = order.customer_email
      const existing = clientSpending.get(email) || {
        name: order.customer_name,
        email,
        totalSpent: 0,
        orderCount: 0,
      }
      existing.totalSpent += order.amount || 0
      existing.orderCount += 1
      clientSpending.set(email, existing)
    })

    const topClients = Array.from(clientSpending.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // Get popular plugins
    const { data: pluginPurchases } = await supabase
      .from("plugin_purchases")
      .select(`
        amount,
        plugins (
          name,
          download_count
        )
      `)
      .eq("status", "paid")
      .gte("created_at", startDate.toISOString())

    const pluginStats = new Map()
    pluginPurchases?.forEach((purchase) => {
      if (purchase.plugins) {
        const name = purchase.plugins.name
        const existing = pluginStats.get(name) || {
          name,
          downloads: purchase.plugins.download_count || 0,
          revenue: 0,
        }
        existing.revenue += purchase.amount || 0
        pluginStats.set(name, existing)
      }
    })

    const popularPlugins = Array.from(pluginStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Generate daily revenue data (mock data for now)
    const dailyRevenue = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      dailyRevenue.push({
        date: date.toLocaleDateString("id-ID", { month: "short", day: "numeric" }),
        service: Math.floor(Math.random() * 5000000) + 1000000,
        plugin: Math.floor(Math.random() * 2000000) + 500000,
        total: 0,
      })
    }
    dailyRevenue.forEach((day) => {
      day.total = day.service + day.plugin
    })

    // Generate weekly orders data (mock data for now)
    const weeklyOrders = []
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      weeklyOrders.push({
        week: `Week ${4 - i}`,
        orders: Math.floor(Math.random() * 20) + 10,
        completed: Math.floor(Math.random() * 15) + 8,
      })
    }

    // Generate monthly trends (mock data for now)
    const monthlyTrends = []
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    months.forEach((month) => {
      monthlyTrends.push({
        month,
        revenue: Math.floor(Math.random() * 50000000) + 20000000,
        orders: Math.floor(Math.random() * 100) + 50,
        clients: Math.floor(Math.random() * 50) + 20,
      })
    })

    const stats = {
      totalRevenue,
      serviceRevenue,
      pluginRevenue: pluginRevenueTotal,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalClients,
      activeClients,
      topClients,
      popularPlugins,
      dailyRevenue,
      weeklyOrders,
      monthlyTrends,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
