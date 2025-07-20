"use client"

import * as React from "react"

type Language = "id" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined)

// Translation data
const translations = {
  id: {
    // Navigation
    "nav.home": "Beranda",
    "nav.services": "Layanan",
    "nav.portfolio": "Portfolio",
    "nav.plugins": "Plugin Store",
    "nav.contact": "Kontak",
    "nav.login": "Masuk",

    // Hero Section
    "hero.title": "Solusi Desain Teknik Profesional",
    "hero.subtitle": "Jasa AutoCAD, SketchUp, RAB, dan Plugin Premium untuk Kebutuhan Konstruksi Anda",
    "hero.cta": "Mulai Proyek",
    "hero.learn_more": "Pelajari Lebih Lanjut",

    // Services
    "services.title": "Layanan Kami",
    "services.subtitle": "Solusi lengkap untuk kebutuhan desain teknik dan konstruksi",
    "services.autocad.title": "AutoCAD 2D/3D",
    "services.autocad.desc": "Gambar teknik profesional untuk arsitektur dan engineering",
    "services.sketchup.title": "SketchUp 3D",
    "services.sketchup.desc": "Visualisasi 3D yang realistis untuk presentasi proyek",
    "services.rab.title": "RAB & Estimasi",
    "services.rab.desc": "Rencana Anggaran Biaya yang akurat dan detail",

    // Common
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
    "common.submit": "Kirim",
    "common.back": "Kembali",
    "common.next": "Selanjutnya",
    "common.previous": "Sebelumnya",

    // Forms
    "form.name": "Nama Lengkap",
    "form.email": "Email",
    "form.phone": "Nomor Telepon",
    "form.message": "Pesan",
    "form.required": "Wajib diisi",
    "form.invalid_email": "Format email tidak valid",
    "form.invalid_phone": "Format nomor telepon tidak valid",

    // Order Form
    "order.title": "Form Pemesanan",
    "order.service": "Jenis Layanan",
    "order.area": "Luas Bangunan (m²)",
    "order.notes": "Catatan Tambahan",
    "order.files": "Upload File",
    "order.total": "Total Pembayaran",
    "order.submit": "Lanjut ke Pembayaran",

    // Payment
    "payment.success": "Pembayaran Berhasil!",
    "payment.failed": "Pembayaran Gagal",
    "payment.pending": "Pembayaran Pending",

    // Admin
    "admin.dashboard": "Dashboard Admin",
    "admin.orders": "Kelola Order",
    "admin.plugins": "Kelola Plugin",
    "admin.services": "Kelola Layanan",
    "admin.stats": "Statistik",
    "admin.chat": "Chat Management",

    // Plugin Store
    "plugins.title": "Plugin Store",
    "plugins.subtitle": "Plugin premium untuk AutoCAD dan SketchUp",
    "plugins.buy": "Beli Sekarang",
    "plugins.download": "Download",
    "plugins.purchased": "Sudah Dibeli",

    // Chat
    "chat.title": "Chat Support",
    "chat.type_message": "Ketik pesan...",
    "chat.send": "Kirim",
    "chat.upload_file": "Upload File",

    // Footer
    "footer.about": "Tentang Kami",
    "footer.services": "Layanan",
    "footer.contact": "Kontak",
    "footer.follow": "Ikuti Kami",
    "footer.rights": "Hak Cipta Dilindungi",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.portfolio": "Portfolio",
    "nav.plugins": "Plugin Store",
    "nav.contact": "Contact",
    "nav.login": "Login",

    // Hero Section
    "hero.title": "Professional Technical Design Solutions",
    "hero.subtitle": "AutoCAD, SketchUp, BOQ Services, and Premium Plugins for Your Construction Needs",
    "hero.cta": "Start Project",
    "hero.learn_more": "Learn More",

    // Services
    "services.title": "Our Services",
    "services.subtitle": "Complete solutions for technical design and construction needs",
    "services.autocad.title": "AutoCAD 2D/3D",
    "services.autocad.desc": "Professional technical drawings for architecture and engineering",
    "services.sketchup.title": "SketchUp 3D",
    "services.sketchup.desc": "Realistic 3D visualization for project presentations",
    "services.rab.title": "BOQ & Estimation",
    "services.rab.desc": "Accurate and detailed Bill of Quantities",

    // Common
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
    "common.submit": "Submit",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",

    // Forms
    "form.name": "Full Name",
    "form.email": "Email",
    "form.phone": "Phone Number",
    "form.message": "Message",
    "form.required": "Required field",
    "form.invalid_email": "Invalid email format",
    "form.invalid_phone": "Invalid phone number format",

    // Order Form
    "order.title": "Order Form",
    "order.service": "Service Type",
    "order.area": "Building Area (m²)",
    "order.notes": "Additional Notes",
    "order.files": "Upload Files",
    "order.total": "Total Payment",
    "order.submit": "Proceed to Payment",

    // Payment
    "payment.success": "Payment Successful!",
    "payment.failed": "Payment Failed",
    "payment.pending": "Payment Pending",

    // Admin
    "admin.dashboard": "Admin Dashboard",
    "admin.orders": "Manage Orders",
    "admin.plugins": "Manage Plugins",
    "admin.services": "Manage Services",
    "admin.stats": "Statistics",
    "admin.chat": "Chat Management",

    // Plugin Store
    "plugins.title": "Plugin Store",
    "plugins.subtitle": "Premium plugins for AutoCAD and SketchUp",
    "plugins.buy": "Buy Now",
    "plugins.download": "Download",
    "plugins.purchased": "Purchased",

    // Chat
    "chat.title": "Chat Support",
    "chat.type_message": "Type a message...",
    "chat.send": "Send",
    "chat.upload_file": "Upload File",

    // Footer
    "footer.about": "About Us",
    "footer.services": "Services",
    "footer.contact": "Contact",
    "footer.follow": "Follow Us",
    "footer.rights": "All Rights Reserved",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("id")

  React.useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "id" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = React.useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage)
    localStorage.setItem("language", newLanguage)
  }, [])

  const t = React.useCallback(
    (key: string): string => {
      return translations[language][key as keyof (typeof translations)[typeof language]] || key
    },
    [language],
  )

  const value = React.useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = React.useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
