import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DraftingCompassIcon as Drafting, Box, Calculator, Puzzle } from "lucide-react"

export function Services() {
  const services = [
    {
      icon: Drafting,
      title: "AutoCAD 2D",
      description: "Gambar teknik 2D profesional untuk berbagai kebutuhan konstruksi dan arsitektur",
      features: ["Denah Bangunan", "Detail Konstruksi", "Shop Drawing", "As Built Drawing"],
      price: "Mulai dari Rp 500.000",
      popular: false,
    },
    {
      icon: Box,
      title: "SketchUp 3D",
      description: "Visualisasi 3D yang memukau untuk presentasi proyek yang lebih menarik",
      features: ["3D Modeling", "Rendering Realistis", "Walkthrough", "Material Mapping"],
      price: "Mulai dari Rp 1.000.000",
      popular: true,
    },
    {
      icon: Calculator,
      title: "RAB (Rencana Anggaran Biaya)",
      description: "Perhitungan anggaran biaya yang akurat dan detail untuk proyek konstruksi",
      features: ["Analisa Harga Satuan", "Bill of Quantity", "Time Schedule", "Cash Flow"],
      price: "Mulai dari Rp 750.000",
      popular: false,
    },
    {
      icon: Puzzle,
      title: "Plugin Premium",
      description: "Plugin khusus untuk AutoCAD dan SketchUp yang meningkatkan produktivitas",
      features: ["Auto Dimensioning", "Smart Blocks", "Batch Processing", "Custom Tools"],
      price: "Mulai dari Rp 250.000",
      popular: false,
    },
  ]

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Layanan Profesional Kami</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kami menyediakan berbagai layanan desain teknik dengan standar industri tertinggi
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className={`relative ${service.popular ? "ring-2 ring-blue-500" : ""}`}>
              {service.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Paling Populer
                </Badge>
              )}
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="pt-4 border-t">
                  <div className="text-lg font-semibold text-blue-600 mb-3">{service.price}</div>
                  <Button className="w-full" variant={service.popular ? "default" : "outline"}>
                    Pesan Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
