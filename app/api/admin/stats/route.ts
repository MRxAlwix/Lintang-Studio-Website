import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "month" // month, week, day

    const now = new Date()
    let startDate: Date
    let dateFormat: string

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFormat = "YYYY-MM-DD"
        break
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        dateFormat = "YYYY-MM-DD HH24:00"
        break
      default: // month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFormat = "YYYY-MM-DD"
    }

    // Get revenue stats
    const { data: revenueData, error: revenueError } = await supabase
      .from("orders")
      .select("amount, created_at")
      .eq("status", "paid")
      .gte("created_at", startDate.toISOString())

    const { data: pluginRevenueData, error: pluginRevenueError } = await supabase
      .from("plugin_purchases")
      .select("amount, created_at")
      .eq("status", "paid")
      .gte("created_at", startDate.toISOString())

    // Get order stats
    const { data: orderStats, error: orderError } = await supabase
      .from("orders")
      .select("status, created_at")
      .gte("created_at", startDate.toISOString())

    // Get plugin sales stats
    const { data: pluginStats, error: pluginError } = await supabase
      .from("plugin_purchases")
      .select("status, created_at, plugin_id")
      .gte("created_at", startDate.toISOString())

    // Get top clients
    const { data: topClients, error: clientError } = await supabase
      .from("orders")
      .select("customer_name, customer_email, amount")
      .eq("status", "paid")
      .gte("created_at", startDate.toISOString())

    if (revenueError || pluginRevenueError || orderError || pluginError || clientError) {
      console.error("Database error:", { revenueError, pluginRevenueError, orderError, pluginError, clientError })
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
    }

    // Calculate total revenue
    const serviceRevenue = revenueData?.reduce((sum, order) => sum + (order.amount || 0), 0) || 0
    const pluginRevenue = pluginRevenueData?.reduce((sum, purchase) => sum + (purchase.amount || 0), 0) || 0
    const totalRevenue = serviceRevenue + pluginRevenue

    // Calculate order counts
    const totalOrders = orderStats?.length || 0
    const pendingOrders = orderStats?.filter((o) => o.status === "pending_payment").length || 0
    const completedOrders = orderStats?.filter((o) => o.status === "paid").length || 0

    // Calculate plugin sales
    const totalPluginSales = pluginStats?.filter((p) => p.status === "paid").length || 0

    // Calculate top clients
    const clientMap = new Map()
    topClients?.forEach((order) => {
      const key = order.customer_email
      if (clientMap.has(key)) {
        clientMap.get(key).totalSpent += order.amount || 0
        clientMap.get(key).orderCount += 1
      } else {
        clientMap.set(key, {
          name: order.customer_name,
          email: order.customer_email,
          totalSpent: order.amount || 0,
          orderCount: 1,
        })
      }
    })

    const topClientsList = Array.from(clientMap.values())
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // Generate daily revenue chart data
    const chartData = []
    const dayMap = new Map()

    // Initialize days
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split("T")[0]
      dayMap.set(dateKey, { date: dateKey, revenue: 0, orders: 0, plugins: 0 })
    }

    // Add service revenue
    revenueData?.forEach((order) => {
      const dateKey = order.created_at.split("T")[0]
      if (dayMap.has(dateKey)) {
        dayMap.get(dateKey).revenue += order.amount || 0
        dayMap.get(dateKey).orders += 1
      }
    })

    // Add plugin revenue
    pluginRevenueData?.forEach((purchase) => {
      const dateKey = purchase.created_at.split("T")[0]
      if (dayMap.has(dateKey)) {
        dayMap.get(dateKey).revenue += purchase.amount || 0
        dayMap.get(dateKey).plugins += 1
      }
    })

    chartData.push(...Array.from(dayMap.values()))

    return NextResponse.json({
      summary: {
        totalRevenue,
        serviceRevenue,
        pluginRevenue,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalPluginSales,
      },
      topClients: topClientsList,
      chartData,
      period,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
