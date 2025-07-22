"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Star, Users, Award, Zap } from "lucide-react"
import Image from "next/image"

interface HeroProps {
  onOrderClick: () => void
}

export function Hero({ onOrderClick }: HeroProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const scrollToCalculator = () => {
    const calculatorSection = document.getElementById("price-calculator")
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-4 py-2 text-sm font-medium">
                <Star className="w-4 h-4 mr-2" />
                Trusted by 500+ Clients
              </Badge>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Solusi Desain{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Teknik Profesional
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl"
            >
              Jasa AutoCAD 2D, SketchUp 3D, RAB, dan Plugin Premium untuk kebutuhan konstruksi dan arsitektur Anda.
              Dikerjakan oleh <strong>Abimanyu Lintang Wibowo</strong> dengan pengalaman 5+ tahun.
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="grid grid-cols-3 gap-6 mb-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">500+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Proyek Selesai</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">98%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Kepuasan Klien</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">24h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Respon Cepat</div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                onClick={scrollToCalculator}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Hitung Estimasi Harga
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => setIsVideoPlaying(true)}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-8 py-4 text-lg font-semibold rounded-xl"
              >
                <Play className="mr-2 h-5 w-5" />
                Lihat Portfolio
              </Button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600 dark:text-gray-400">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Pengerjaan Cepat</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600 dark:text-gray-400">
                <Award className="h-5 w-5 text-blue-500" />
                <span className="text-sm">Kualitas Premium</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start space-x-2 text-gray-600 dark:text-gray-400">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-sm">Support 24/7</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/placeholder.svg?height=600&width=800&text=AutoCAD+SketchUp+Design"
                  alt="Lintang Studio - Professional Technical Design"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  priority
                />

                {/* Play Button Overlay */}
                {!isVideoPlaying && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Button
                      size="lg"
                      onClick={() => setIsVideoPlaying(true)}
                      className="bg-white/90 hover:bg-white text-blue-600 rounded-full p-6 shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
                    >
                      <Play className="h-8 w-8" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2D</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">AutoCAD</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Professional Drawing</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">3D</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">SketchUp</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">3D Modeling</div>
                  </div>
                </div>
              </motion.div>

              {/* Background Decoration */}
              <div className="absolute -z-10 top-8 left-8 w-full h-full bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-800 dark:to-indigo-800 rounded-2xl opacity-20"></div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Scroll untuk melihat layanan</span>
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
