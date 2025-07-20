"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  MessageCircle,
  Search,
  Eye,
  Clock,
  User,
  AlertTriangle,
  Ban,
  CheckCircle,
  RefreshCw,
  Shield,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import Link from "next/link"
import { toast } from "sonner"

interface ChatRoom {
  id: string
  order_id: string
  client_name: string
  client_email: string
  service_type: string
  status: string
  user_status?: string
  spam_score?: number
  consecutive_messages?: number
  is_input_disabled?: boolean
  created_at: string
  last_message?: string
  last_message_time?: string
  unread_count?: number
}

interface UserStats {
  total_messages: number
  messages_without_admin_reply: number
  rate_limit_violations: number
  spam_warnings: number
  is_rate_limited: boolean
  user_status: string
  payment_status: string
}

export default function AdminChatPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [filteredRooms, setFilteredRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  useEffect(() => {
    fetchChatRooms()
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchChatRooms, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterRooms()
  }, [chatRooms, searchTerm, statusFilter])

  const fetchChatRooms = async () => {
    try {
      const response = await fetch("/api/admin/chat/rooms")
      if (response.ok) {
        const data = await response.json()
        setChatRooms(data)
      }
    } catch (error) {
      console.error("Error fetching chat rooms:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async (roomId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/rooms/${roomId}/stats`)
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
    }
  }

  const filterRooms = () => {
    let filtered = chatRooms

    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.client_email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "spam_risk") {
        filtered = filtered.filter((room) => (room.spam_score || 0) > 3 || room.user_status === "spam_warning")
      } else if (statusFilter === "blocked") {
        filtered = filtered.filter((room) => room.user_status === "temporarily_blocked" || room.is_input_disabled)
      } else if (statusFilter === "frequent") {
        filtered = filtered.filter((room) => room.user_status === "frequent_asker")
      } else {
        filtered = filtered.filter((room) => room.user_status === statusFilter)
      }
    }

    setFilteredRooms(filtered)
  }

  const handleUnblockUser = async (roomId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/rooms/${roomId}/unblock`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("User berhasil di-unblock")
        fetchChatRooms()
      } else {
        toast.error("Gagal unblock user")
      }
    } catch (error) {
      console.error("Error unblocking user:", error)
      toast.error("Gagal unblock user")
    }
  }

  const handleResetSpamScore = async (roomId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/rooms/${roomId}/reset-spam`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Spam score berhasil direset")
        fetchChatRooms()
      } else {
        toast.error("Gagal reset spam score")
      }
    } catch (error) {
      console.error("Error resetting spam score:", error)
      toast.error("Gagal reset spam score")
    }
  }

  const getUserStatusBadge = (userStatus?: string, spamScore?: number, isInputDisabled?: boolean) => {
    if (isInputDisabled) {
      return <Badge className="bg-red-100 text-red-800">Diblokir</Badge>
    }

    switch (userStatus) {
      case "frequent_asker":
        return <Badge className="bg-yellow-100 text-yellow-800">Sering Bertanya</Badge>
      case "spam_warning":
        return <Badge className="bg-orange-100 text-orange-800">Peringatan Spam</Badge>
      case "temporarily_blocked":
        return <Badge className="bg-red-100 text-red-800">Diblokir Sementara</Badge>
      case "unpaid":
        return <Badge className="bg-gray-100 text-gray-800">Belum Bayar</Badge>
      default:
        if (spamScore && spamScore > 3) {
          return <Badge className="bg-orange-100 text-orange-800">Risiko Spam</Badge>
        }
        return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
    }
  }

  const getSpamScoreColor = (score?: number) => {
    if (!score) return "text-green-600"
    if (score < 3) return "text-yellow-600"
    if (score < 6) return "text-orange-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat chat rooms...</p>
        </div>
      </div>
    )
  }

  const stats = {
    total: chatRooms.length,
    active: chatRooms.filter((r) => r.status === "active").length,
    spamRisk: chatRooms.filter((r) => (r.spam_score || 0) > 3).length,
    blocked: chatRooms.filter((r) => r.is_input_disabled || r.user_status === "temporarily_blocked").length,
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Chat Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Chat Aktif</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risiko Spam</p>
                <p className="text-2xl font-bold text-orange-600">{stats.spamRisk}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Diblokir</p>
                <p className="text-2xl font-bold text-red-600">{stats.blocked}</p>
              </div>
              <Ban className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Cari berdasarkan nama klien, order ID, email, atau layanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="frequent">Sering Bertanya</SelectItem>
                  <SelectItem value="spam_risk">Risiko Spam</SelectItem>
                  <SelectItem value="blocked">Diblokir</SelectItem>
                  <SelectItem value="unpaid">Belum Bayar</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={fetchChatRooms}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Chat Rooms</CardTitle>
          <CardDescription>Total: {filteredRooms.length} chat rooms</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRooms.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" ? "Tidak ada chat room ditemukan" : "Belum ada chat room"}
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Coba ubah filter pencarian"
                  : "Chat room akan muncul setelah klien menyelesaikan pembayaran"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Klien</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Status User</TableHead>
                  <TableHead>Spam Score</TableHead>
                  <TableHead>Pesan Berturut</TableHead>
                  <TableHead>Pesan Terakhir</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">{room.client_name}</div>
                          <div className="text-sm text-gray-600">{room.client_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{room.order_id}</TableCell>
                    <TableCell>{room.service_type}</TableCell>
                    <TableCell>
                      {getUserStatusBadge(room.user_status, room.spam_score, room.is_input_disabled)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getSpamScoreColor(room.spam_score)}`}>
                        {room.spam_score || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          room.consecutive_messages && room.consecutive_messages > 5
                            ? "text-orange-600 font-medium"
                            : ""
                        }
                      >
                        {room.consecutive_messages || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      {room.last_message_time ? (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {formatDistanceToNow(new Date(room.last_message_time), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRoom(room)
                            fetchUserStats(room.id)
                            setShowStatsModal(true)
                          }}
                          title="Lihat Stats"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" asChild title="Buka Chat">
                          <Link href={`/chat/${room.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {(room.is_input_disabled || room.user_status === "temporarily_blocked") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnblockUser(room.id)}
                            className="text-green-600"
                            title="Unblock User"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {room.spam_score && room.spam_score > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetSpamScore(room.id)}
                            className="text-blue-600"
                            title="Reset Spam Score"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* User Stats Modal */}
      <Dialog open={showStatsModal} onOpenChange={setShowStatsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Statistics & Anti-Spam Info</DialogTitle>
            <DialogDescription>
              Detail statistik dan status anti-spam untuk {selectedRoom?.client_name}
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && userStats && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nama Klien</label>
                    <p className="font-medium">{selectedRoom.client_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p>{selectedRoom.client_email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order ID</label>
                    <p className="font-mono text-sm">{selectedRoom.order_id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status User</label>
                    <div className="mt-1">
                      {getUserStatusBadge(
                        selectedRoom.user_status,
                        selectedRoom.spam_score,
                        selectedRoom.is_input_disabled,
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status Pembayaran</label>
                    <p className="capitalize">{userStats.payment_status}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Layanan</label>
                    <p>{selectedRoom.service_type}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Message Statistics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pesan:</span>
                      <span className="font-medium">{userStats.total_messages}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pesan Tanpa Respon:</span>
                      <span
                        className={`font-medium ${userStats.messages_without_admin_reply > 8 ? "text-red-600" : ""}`}
                      >
                        {userStats.messages_without_admin_reply}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pesan Berturut:</span>
                      <span
                        className={`font-medium ${(selectedRoom.consecutive_messages || 0) > 8 ? "text-orange-600" : ""}`}
                      >
                        {selectedRoom.consecutive_messages || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Anti-Spam Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spam Score:</span>
                      <span className={`font-medium ${getSpamScoreColor(selectedRoom.spam_score)}`}>
                        {selectedRoom.spam_score || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate Limit Violations:</span>
                      <span className={`font-medium ${userStats.rate_limit_violations > 3 ? "text-red-600" : ""}`}>
                        {userStats.rate_limit_violations}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Spam Warnings:</span>
                      <span className={`font-medium ${userStats.spam_warnings > 0 ? "text-orange-600" : ""}`}>
                        {userStats.spam_warnings}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rate Limited:</span>
                      <Badge
                        className={
                          userStats.is_rate_limited ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                        }
                      >
                        {userStats.is_rate_limited ? "Ya" : "Tidak"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={() => handleUnblockUser(selectedRoom.id)}
                  disabled={!selectedRoom.is_input_disabled && selectedRoom.user_status !== "temporarily_blocked"}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Unblock User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleResetSpamScore(selectedRoom.id)}
                  disabled={!selectedRoom.spam_score || selectedRoom.spam_score === 0}
                  className="flex-1 bg-transparent"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset Spam Score
                </Button>
                <Button variant="outline" asChild className="flex-1 bg-transparent">
                  <Link href={`/chat/${selectedRoom.id}`}>
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Buka Chat
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
