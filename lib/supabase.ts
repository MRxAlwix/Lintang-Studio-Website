import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export type Service = {
  id: string
  name: string
  description: string
  price: number
  category: "autocad" | "sketchup" | "rab" | "plugin"
  features: string[]
  created_at: string
  updated_at: string
}

export type Plugin = {
  id: string
  name: string
  description: string
  version: string
  price: number
  file_url: string
  download_count: number
  category: "autocad" | "sketchup"
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  user_id: string
  service_id?: string
  plugin_id?: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  amount: number
  notes?: string
  created_at: string
  updated_at: string
}

export type Profile = {
  id: string
  user_id: string
  full_name: string
  company?: string
  phone: string
  role: "admin" | "client"
  created_at: string
  updated_at: string
}
