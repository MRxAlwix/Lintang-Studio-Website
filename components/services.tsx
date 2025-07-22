"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Ruler,
  CuboidIcon as Cube,
  Calculator,
  Puzzle,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Award,
} from "lucide-react"

const services = [
  {
    id: "autocad-2d",
    icon: Ruler,
    title: "AutoCAD 2D",
    description: "Gambar teknik profesional untuk konstruksi dan arsitektur",
    features: [
      "Denah, tampak, potongan",
      "Detail konstruksi",
      "Gambar kerja lengkap",
      "File DWG original",
      "Revisi unlimited",
    ],
    pricing: "Mulai dari Rp 15.000/m²",
    duration: "3-7 hari kerja",
    popular: true,
    gradient: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "sketchup-3d",
    icon: Cube,
    title: "SketchUp 3D",
    description: "Visualisasi 3D realistis untuk presentasi proyek",
    features: [
      "3D modeling detail",
      "Rendering berkualitas tinggi",
      "Walkthrough animation",
      "Material realistis",
      "Multiple camera angles",
    ],
    pricing: "Mulai dari Rp 25.000/m²",
    duration: "5-10 hari kerja",
    popular: false,
    gradient: "from-green-500 to-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    id: "rab",
    icon: Calculator,
    title: "RAB (Rencana Anggaran Biaya)",
    description: "Perhitungan biaya konstruksi yang akurat dan detail",
    features: [
      "Analisa harga satuan",
      "Bill of quantity (BOQ)",
      "Time schedule",
      "Cash flow diagram",
      "Laporan Excel & PDF",
    ],
    pricing: "Mulai dari Rp 12.000/m²",
    duration: "2-5 hari kerja",
    popular: false,
    gradient: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    id: "plugin-premium",
    icon: Puzzle,
    title: "Plugin Premium",
    description: "Plugin khusus untuk meningkatkan produktivitas AutoCAD & SketchUp",
    features: [
      "Auto dimensioning tools",
      "Smart block library",
      "Batch processing",
      "Custom commands",
      "Lifetime updates",
    ],
    pricing: "Mulai dari Rp 250.000",
    duration: "Download instan",
    popular: false,
    gradient: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

interface ServicesProps {
  onServiceSelect?: (serviceId: string) => void
}

export function Services({ onServiceSelect }: ServicesProps) {
  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById("price-calculator")
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Layanan Profesional
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Solusi Desain Teknik
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Terlengkap
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Dari konsep hingga realisasi, kami menyediakan layanan desain teknik profesional dengan kualitas terbaik dan
            harga kompetitif.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16"
        >
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
              className="relative"
            >
              <Card
                className={`h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 ${service.bgColor} overflow-hidden group`}
              >
                {/* Popular Badge */}
                {service.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold">
                      <Star className="w-3 h-3 mr-1" />
                      Populer
                    </Badge>
                  </div>
                )}

                {/* Background Gradient */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-500`}
                />

                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl ${service.bgColor} flex items-center justify-center shadow-lg`}
                    >
                      <service.icon className={`w-8 h-8 ${service.iconColor}`} />
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 text-base">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10">
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Yang Anda Dapatkan:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pricing & Duration */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Harga:</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">{service.pricing}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Durasi:</span>
                      <span className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4 mr-1" />
                        {service.duration}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={scrollToCalculator}
                    className={`w-full bg-gradient-to-r ${service.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-white font-semibold`}
                  >
                    Hitung Estimasi
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white"
        >
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Mengapa Memilih Lintang Studio?</h3>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              Pengalaman dan dedikasi kami dalam memberikan solusi desain teknik terbaik
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Klien Puas</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">5+</div>
              <div className="text-blue-100">Tahun Pengalaman</div>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Tingkat Kepuasan</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
