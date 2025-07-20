"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Language = "id" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation data
const translations = {
  id: {
    "common.home": "Beranda",
    "common.services": "Layanan",
    "common.plugins": "Plugin Store",
    "common.portfolio": "Portfolio",
    "common.testimonials": "Testimoni",
    "common.contact": "Kontak",
    "common.login": "Login",
    "common.logout": "Logout",
    "common.switchLanguage": "Ganti Bahasa",
    "common.loading": "Memuat...",
    "common.error": "Terjadi kesalahan",
    "common.success": "Berhasil",
    "common.cancel": "Batal",
    "common.save": "Simpan",
    "common.delete": "Hapus",
    "common.edit": "Edit",
    "common.view": "Lihat",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.search": "Cari",
    "common.filter": "Filter",
    "common.all": "Semua",
    "common.active": "Aktif",
    "common.inactive": "Tidak Aktif",
    "common.pending": "Menunggu",
    "common.completed": "Selesai",
    "common.processing": "Memproses",
    "hero.title": "Solusi Desain Teknik Profesional",
    "hero.subtitle":
      "Jasa desain AutoCAD 2D, SketchUp 3D, RAB, dan plugin premium untuk kebutuhan konstruksi dan arsitektur Anda.",
    "hero.cta": "Mulai Proyek",
    "hero.learnMore": "Pelajari Lebih Lanjut",
    "services.title": "Layanan Kami",
    "services.subtitle": "Solusi lengkap untuk kebutuhan desain teknik Anda",
    "services.autocad.title": "AutoCAD 2D",
    "services.autocad.description": "Gambar teknik 2D profesional dengan detail lengkap",
    "services.sketchup.title": "SketchUp 3D",
    "services.sketchup.description": "Visualisasi 3D yang memukau untuk presentasi proyek",
    "services.rab.title": "RAB (Rencana Anggaran Biaya)",
    "services.rab.description": "Perhitungan biaya konstruksi yang akurat dan detail",
    "plugins.title": "Plugin Store",
    "plugins.subtitle": "Plugin premium untuk meningkatkan produktivitas desain Anda",
    "plugins.search": "Cari plugin...",
    "plugins.category": "Kategori",
    "plugins.sortBy": "Urutkan",
    "plugins.price": "Harga",
    "plugins.downloads": "Downloads",
    "plugins.rating": "Rating",
    "plugins.buyNow": "Beli Sekarang",
    "plugins.viewDetails": "Lihat Detail",
    "order.title": "Form Pemesanan Jasa",
    "order.subtitle": "Lengkapi data berikut untuk memproses pesanan Anda",
    "order.personalInfo": "Informasi Pribadi",
    "order.fullName": "Nama Lengkap",
    "order.email": "Email",
    "order.whatsapp": "Nomor WhatsApp",
    "order.projectInfo": "Informasi Proyek",
    "order.serviceType": "Jenis Layanan",
    "order.area": "Luas Bangunan (m²)",
    "order.notes": "Catatan Tambahan",
    "order.fileUpload": "Upload File (Opsional)",
    "order.promoCode": "Kode Promo",
    "order.subtotal": "Subtotal",
    "order.discount": "Diskon",
    "order.total": "Total Akhir",
    "order.submit": "Lanjut ke Pembayaran",
    "admin.dashboard": "Dashboard Admin",
    "admin.orders": "Kelola Order",
    "admin.plugins": "Kelola Plugin",
    "admin.clients": "Kelola Klien",
    "admin.chat": "Kelola Chat",
    "admin.stats": "Statistik",
    "admin.settings": "Pengaturan",
    "chat.title": "Chat Support",
    "chat.sendMessage": "Kirim Pesan",
    "chat.uploadFile": "Upload File",
    "chat.typing": "Sedang mengetik...",
    "invoice.title": "Invoice",
    "invoice.number": "Nomor Invoice",
    "invoice.date": "Tanggal",
    "invoice.customer": "Pelanggan",
    "invoice.service": "Layanan",
    "invoice.amount": "Jumlah",
    "invoice.status": "Status",
    "invoice.download": "Download Invoice",
  },
  en: {
    "common.home": "Home",
    "common.services": "Services",
    "common.plugins": "Plugin Store",
    "common.portfolio": "Portfolio",
    "common.testimonials": "Testimonials",
    "common.contact": "Contact",
    "common.login": "Login",
    "common.logout": "Logout",
    "common.switchLanguage": "Switch Language",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.pending": "Pending",
    "common.completed": "Completed",
    "common.processing": "Processing",
    "hero.title": "Professional Technical Design Solutions",
    "hero.subtitle":
      "AutoCAD 2D design services, SketchUp 3D, BOQ, and premium plugins for your construction and architecture needs.",
    "hero.cta": "Start Project",
    "hero.learnMore": "Learn More",
    "services.title": "Our Services",
    "services.subtitle": "Complete solutions for your technical design needs",
    "services.autocad.title": "AutoCAD 2D",
    "services.autocad.description": "Professional 2D technical drawings with complete details",
    "services.sketchup.title": "SketchUp 3D",
    "services.sketchup.description": "Stunning 3D visualization for project presentations",
    "services.rab.title": "BOQ (Bill of Quantities)",
    "services.rab.description": "Accurate and detailed construction cost calculations",
    "plugins.title": "Plugin Store",
    "plugins.subtitle": "Premium plugins to boost your design productivity",
    "plugins.search": "Search plugins...",
    "plugins.category": "Category",
    "plugins.sortBy": "Sort by",
    "plugins.price": "Price",
    "plugins.downloads": "Downloads",
    "plugins.rating": "Rating",
    "plugins.buyNow": "Buy Now",
    "plugins.viewDetails": "View Details",
    "order.title": "Service Order Form",
    "order.subtitle": "Complete the following data to process your order",
    "order.personalInfo": "Personal Information",
    "order.fullName": "Full Name",
    "order.email": "Email",
    "order.whatsapp": "WhatsApp Number",
    "order.projectInfo": "Project Information",
    "order.serviceType": "Service Type",
    "order.area": "Building Area (m²)",
    "order.notes": "Additional Notes",
    "order.fileUpload": "File Upload (Optional)",
    "order.promoCode": "Promo Code",
    "order.subtotal": "Subtotal",
    "order.discount": "Discount",
    "order.total": "Final Total",
    "order.submit": "Proceed to Payment",
    "admin.dashboard": "Admin Dashboard",
    "admin.orders": "Manage Orders",
    "admin.plugins": "Manage Plugins",
    "admin.clients": "Manage Clients",
    "admin.chat": "Manage Chat",
    "admin.stats": "Statistics",
    "admin.settings": "Settings",
    "chat.title": "Chat Support",
    "chat.sendMessage": "Send Message",
    "chat.uploadFile": "Upload File",
    "chat.typing": "Typing...",
    "invoice.title": "Invoice",
    "invoice.number": "Invoice Number",
    "invoice.date": "Date",
    "invoice.customer": "Customer",
    "invoice.service": "Service",
    "invoice.amount": "Amount",
    "invoice.status": "Status",
    "invoice.download": "Download Invoice",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "id" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
