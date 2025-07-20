import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "7d"

    // Calculate date range based on period
    let dateFilter = ""
    const now = new Date()

    switch (period) {
      case "24h":
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        dateFilter = `created_at >= '${yesterday.toISOString()}'`
        break
      case "7d":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = `created_at >= '${weekAgo.toISOString()}'`
        break
      case "30d":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        dateFilter = `created_at >= '${monthAgo.toISOString()}'`
        break
      case "90d":
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        dateFilter = `created_at >= '${quarterAgo.toISOString()}'`
        break
      case "1y":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        dateFilter = `created_at >= '${yearAgo.toISOString()}'`
        break
      default:
        dateFilter = `created_at >= '${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()}'`
    }

    // Get orders statistics
    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", dateFilter.split("'")[1])

    if (ordersError) {
      console.error("Orders query error:", ordersError)
      return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
    }

    // Get plugin purchases statistics
    const { data: pluginPurchases, error: pluginError } = await supabase
      .from("plugin_purchases")
      .select("*, plugins(name)")
      .gte("created_at", dateFilter.split("'")[1])

    if (pluginError) {
      console.error("Plugin purchases query error:", pluginError)
    }

    // Get plugins data
    const { data: plugins, error: pluginsError } = await supabase.from("plugins").select("*")

    if (pluginsError) {
      console.error("Plugins query error:", pluginsError)
    }

    // Calculate statistics
    const totalOrders = orders?.length || 0
    const completedOrders = orders?.filter((o) => o.status === "completed").length || 0
    const pendingOrders = orders?.filter((o) => o.status === "pending_payment").length || 0

    const serviceRevenue = orders?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
    const pluginRevenue = pluginPurchases?.reduce((sum, purchase) => sum + (purchase.final_amount || 0), 0) || 0
    const totalRevenue = serviceRevenue + pluginRevenue

    // Get unique clients
    const allEmails = [
      ...(orders?.map((o) => o.customer_email) || []),
      ...(pluginPurchases?.map((p) => p.customer_email) || []),
    ]
    const uniqueEmails = [...new Set(allEmails)]
    const totalClients = uniqueEmails.length
    const activeClients = uniqueEmails.length // For now, consider all as active

    // Top clients calculation
    const clientSpending: { [email: string]: { name: string; totalSpent: number; orderCount: number } } = {}

    orders?.forEach((order) => {
      if (!clientSpending[order.customer_email]) {
        clientSpending[order.customer_email] = {
          name: order.customer_name,
          totalSpent: 0,
          orderCount: 0,
        }
      }
      clientSpending[order.customer_email].totalSpent += order.amount || 0
      clientSpending[order.customer_email].orderCount += 1
    })

    pluginPurchases?.forEach((purchase) => {
      if (!clientSpending[purchase.customer_email]) {
        clientSpending[purchase.customer_email] = {
          name: purchase.customer_name,
          totalSpent: 0,
          orderCount: 0,
        }
      }
      clientSpending[purchase.customer_email].totalSpent += purchase.final_amount || 0
      clientSpending[purchase.customer_email].orderCount += 1
    })

    const topClients = Object.entries(clientSpending)
      .map(([email, data]) => ({ email, ...data }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)

    // Popular plugins
    const pluginStats: { [id: string]: { name: string; downloads: number; revenue: number } } = {}

    plugins?.forEach((plugin) => {
      pluginStats[plugin.id] = {
        name: plugin.name,
        downloads: plugin.download_count || 0,
        revenue: 0,
      }
    })

    pluginPurchases?.forEach((purchase) => {
      if (pluginStats[purchase.plugin_id]) {
        pluginStats[purchase.plugin_id].revenue += purchase.final_amount || 0
      }
    })

    const popularPlugins = Object.values(pluginStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Daily revenue data (last 30 days for chart)
    const dailyRevenue = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split("T")[0]

      const dayOrders = orders?.filter((o) => o.created_at?.startsWith(dateStr)) || []
      const dayPlugins = pluginPurchases?.filter((p) => p.created_at?.startsWith(dateStr)) || []

      const serviceRevenue = dayOrders.reduce((sum, o) => sum + (o.amount || 0), 0)
      const pluginRevenue = dayPlugins.reduce((sum, p) => sum + (p.final_amount || 0), 0)

      dailyRevenue.push({
        date: dateStr,
        service: serviceRevenue,
        plugin: pluginRevenue,
        total: serviceRevenue + pluginRevenue,
      })
    }

    // Weekly orders data
    const weeklyOrders = []
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

      const weekOrders =
        orders?.filter((o) => {
          const orderDate = new Date(o.created_at)
          return orderDate >= weekStart && orderDate < weekEnd
        }) || []

      weeklyOrders.push({
        week: `Week ${12 - i}`,
        orders: weekOrders.length,
        completed: weekOrders.filter((o) => o.status === "completed").length,
      })
    }

    // Monthly trends (last 12 months)
    const monthlyTrends = []
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthOrders =
        orders?.filter((o) => {
          const orderDate = new Date(o.created_at)
          return orderDate >= monthStart && orderDate <= monthEnd
        }) || []

      const monthPlugins =
        pluginPurchases?.filter((p) => {
          const purchaseDate = new Date(p.created_at)
          return purchaseDate >= monthStart && purchaseDate <= monthEnd
        }) || []

      const monthRevenue =
        monthOrders.reduce((sum, o) => sum + (o.amount || 0), 0) +
        monthPlugins.reduce((sum, p) => sum + (p.final_amount || 0), 0)

      monthlyTrends.push({
        month: monthStart.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
        revenue: monthRevenue,
        orders: monthOrders.length,
        clients: [
          ...new Set([...monthOrders.map((o) => o.customer_email), ...monthPlugins.map((p) => p.customer_email)]),
        ].length,
      })
    }

    const statsData = {
      totalRevenue,
      serviceRevenue,
      pluginRevenue,
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

    return NextResponse.json(statsData)
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
