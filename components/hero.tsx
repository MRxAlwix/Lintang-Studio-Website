import { ArrowRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section id="home" className="pt-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Solusi Desain Teknik
                <span className="text-blue-600"> Profesional</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Lintang Studio menyediakan jasa desain teknik berkualitas tinggi dengan AutoCAD 2D, SketchUp 3D, dan
                RAB. Dipercaya oleh ratusan klien untuk proyek konstruksi dan arsitektur.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Mulai Konsultasi
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Play className="mr-2 h-5 w-5" />
                Lihat Portfolio
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <div>
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Proyek Selesai</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600">Plugin Tersedia</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">98%</div>
                <div className="text-gray-600">Kepuasan Klien</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
              <img
                src="/placeholder.svg?height=500&width=500"
                alt="Lintang Studio Workspace"
                className="w-full h-full object-cover rounded-xl shadow-2xl"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-lg shadow-lg p-4">
              <div className="text-sm font-semibold text-gray-900">AutoCAD Expert</div>
              <div className="text-xs text-gray-600">15+ Years Experience</div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-lg p-4">
              <div className="text-sm font-semibold text-gray-900">SketchUp Pro</div>
              <div className="text-xs text-gray-600">3D Visualization</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
