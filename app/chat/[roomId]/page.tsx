"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ChatScreeningForm } from "@/components/chat-screening-form"
import { ChatRateLimiter } from "@/components/chat-rate-limiter"
import { Send, Paperclip, Download, ArrowLeft, Settings, FileText, ImageIcon, File, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"

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
}

interface Chat {
  id: string
  room_id: string
  sender_id: string
  sender_name: string
  sender_type: "admin" | "client"
  message?: string
  file_url?: string
  file_name?: string
  file_size?: number
  is_read: boolean
  is_spam?: boolean
  spam_reason?: string
  created_at: string
}

interface ChatScreening {
  id: string
  urgency_level: string
  issue_category: string
  description: string
  expected_response_time: string
  is_approved: boolean
}

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const roomId = params.roomId as string

  const [room, setRoom] = useState<ChatRoom | null>(null)
  const [chats, setChats] = useState<Chat[]>([])
  const [screening, setScreening] = useState<ChatScreening | null>(null)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showScreening, setShowScreening] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [rateLimitReason, setRateLimitReason] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (roomId) {
      fetchChatRoom()
      fetchScreening()
      fetchChats()
      // Set up real-time subscription
      const interval = setInterval(fetchChats, 3000)
      return () => clearInterval(interval)
    }
  }, [roomId])

  useEffect(() => {
    scrollToBottom()
  }, [chats])

  const fetchChatRoom = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setRoom(data)
      } else {
        toast.error("Chat room tidak ditemukan")
        router.push("/")
      }
    } catch (error) {
      console.error("Error fetching chat room:", error)
      toast.error("Gagal memuat chat room")
    } finally {
      setLoading(false)
    }
  }

  const fetchScreening = async () => {
    try {
      const response = await fetch(`/api/chat/screening/${roomId}`)
      if (response.ok) {
        const data = await response.json()
        setScreening(data)
      } else {
        // No screening found, show screening form
        setShowScreening(true)
      }
    } catch (error) {
      console.error("Error fetching screening:", error)
      setShowScreening(true)
    }
  }

  const fetchChats = async () => {
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error("Error fetching chats:", error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleRateLimitChange = (isLimited: boolean, reason?: string) => {
    setIsRateLimited(isLimited)
    setRateLimitReason(reason)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending || isRateLimited) return

    setSending(true)
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      })

      if (response.ok) {
        setMessage("")
        fetchChats()
      } else {
        const errorData = await response.json()
        if (errorData.error === "rate_limited") {
          toast.error("Anda mengirim pesan terlalu cepat. Mohon tunggu sebentar.")
        } else {
          toast.error("Gagal mengirim pesan")
        }
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Gagal mengirim pesan")
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || isRateLimited) return

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch(`/api/chat/rooms/${roomId}/upload`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("File berhasil dikirim")
        fetchChats()
      } else {
        const errorData = await response.json()
        if (errorData.error === "rate_limited") {
          toast.error("Anda mengirim file terlalu cepat. Mohon tunggu sebentar.")
        } else {
          toast.error("Gagal mengirim file")
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast.error("Gagal mengirim file")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleDownloadFile = async (fileUrl: string, fileName: string) => {
    try {
      const response = await fetch(`/api/chat/download?file=${encodeURIComponent(fileUrl)}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        toast.error("Gagal mendownload file")
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      toast.error("Gagal mendownload file")
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(extension || "")) {
      return <ImageIcon className="w-4 h-4" />
    }
    if (["pdf", "doc", "docx", "txt"].includes(extension || "")) {
      return <FileText className="w-4 h-4" />
    }
    return <File className="w-4 h-4" />
  }

  const getUserStatusBadge = (userStatus?: string) => {
    switch (userStatus) {
      case "frequent_asker":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            Sering Bertanya
          </Badge>
        )
      case "spam_warning":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700">
            Peringatan Spam
          </Badge>
        )
      case "temporarily_blocked":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700">
            Diblokir Sementara
          </Badge>
        )
      case "unpaid":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700">
            Belum Bayar
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Aktif
          </Badge>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat chat...</p>
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chat Room Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-4">Chat room yang Anda cari tidak tersedia</p>
          <Button onClick={() => router.push("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    )
  }

  // Show screening form if needed
  if (showScreening && !screening) {
    return (
      <ChatScreeningForm
        roomId={roomId}
        orderId={room.order_id}
        customerEmail={room.client_email}
        onComplete={() => {
          setShowScreening(false)
          fetchScreening()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chat - {room.service_type}</h1>
                <p className="text-sm text-gray-600">Order ID: {room.order_id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={room.status === "active" ? "default" : "secondary"}>
                {room.status === "active" ? "Aktif" : "Selesai"}
              </Badge>
              {getUserStatusBadge(room.user_status)}
              {room.spam_score && room.spam_score > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  Spam Score: {room.spam_score}
                </Badge>
              )}
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          {/* Screening Info */}
          {screening && (
            <div className="p-4 bg-blue-50 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-blue-900">Informasi Chat</h3>
                  <div className="flex items-center space-x-4 text-sm text-blue-800 mt-1">
                    <span>
                      Urgensi: <Badge className="bg-blue-100 text-blue-800">{screening.urgency_level}</Badge>
                    </span>
                    <span>Kategori: {screening.issue_category}</span>
                  </div>
                </div>
                {screening.expected_response_time && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Respon: {screening.expected_response_time}
                  </Badge>
                )}
              </div>
              {screening.description && <p className="text-sm text-blue-700 mt-2 italic">"{screening.description}"</p>}
            </div>
          )}

          {/* Rate Limiter */}
          <div className="p-4 border-b">
            <ChatRateLimiter roomId={roomId} userEmail={room.client_email} onRateLimitChange={handleRateLimitChange} />
          </div>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {chats.map((chat) => (
              <div key={chat.id} className={`flex ${chat.sender_type === "admin" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    chat.sender_type === "admin" ? "bg-gray-100 text-gray-900" : "bg-blue-600 text-white"
                  } ${chat.is_spam ? "opacity-60 border-2 border-red-300" : ""}`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {chat.sender_type === "admin" ? "LS" : chat.sender_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{chat.sender_name}</span>
                    {chat.is_spam && (
                      <AlertTriangle className="w-3 h-3 text-red-500" title={`Spam: ${chat.spam_reason}`} />
                    )}
                  </div>

                  {chat.message && <p className="text-sm">{chat.message}</p>}

                  {chat.file_url && (
                    <div className="mt-2 p-2 bg-white/10 rounded border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getFileIcon(chat.file_name || "")}
                          <div>
                            <p className="text-xs font-medium">{chat.file_name}</p>
                            {chat.file_size && <p className="text-xs opacity-75">{formatFileSize(chat.file_size)}</p>}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadFile(chat.file_url!, chat.file_name!)}
                          className="text-current hover:bg-white/20"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs opacity-75 mt-1">
                    {formatDistanceToNow(new Date(chat.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <Separator />

          {/* Message Input */}
          <div className="p-4">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || isRateLimited}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isRateLimited
                    ? rateLimitReason === "payment_not_confirmed"
                      ? "Pembayaran belum dikonfirmasi"
                      : "Chat dinonaktifkan sementara"
                    : "Ketik pesan..."
                }
                disabled={sending || room.status !== "active" || isRateLimited}
                className="flex-1"
              />

              <Button type="submit" disabled={sending || !message.trim() || room.status !== "active" || isRateLimited}>
                <Send className="w-4 h-4" />
              </Button>
            </form>

            {uploading && (
              <div className="mt-2 text-sm text-gray-600 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Mengupload file...
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
