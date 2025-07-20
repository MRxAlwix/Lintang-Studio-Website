import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

export function Portfolio() {
  const projects = [
    {
      title: "Rumah Minimalis 2 Lantai",
      category: "Residential",
      image: "/placeholder.svg?height=300&width=400",
      description: "Desain rumah minimalis modern dengan konsep open space dan pencahayaan alami optimal",
      services: ["AutoCAD 2D", "SketchUp 3D", "RAB"],
    },
    {
      title: "Gedung Perkantoran",
      category: "Commercial",
      image: "/placeholder.svg?height=300&width=400",
      description: "Kompleks perkantoran 5 lantai dengan fasilitas lengkap dan desain sustainable",
      services: ["AutoCAD 2D", "SketchUp 3D"],
    },
    {
      title: "Villa Resort Bali",
      category: "Hospitality",
      image: "/placeholder.svg?height=300&width=400",
      description: "Villa mewah dengan konsep tropical modern yang memadukan budaya lokal",
      services: ["SketchUp 3D", "RAB"],
    },
    {
      title: "Apartemen High-Rise",
      category: "Residential",
      image: "/placeholder.svg?height=300&width=400",
      description: "Apartemen 20 lantai dengan unit studio hingga 3 bedroom dan fasilitas premium",
      services: ["AutoCAD 2D", "SketchUp 3D", "RAB"],
    },
    {
      title: "Shopping Mall",
      category: "Commercial",
      image: "/placeholder.svg?height=300&width=400",
      description: "Pusat perbelanjaan modern dengan konsep mixed-use development",
      services: ["AutoCAD 2D", "SketchUp 3D"],
    },
    {
      title: "Rumah Sakit",
      category: "Healthcare",
      image: "/placeholder.svg?height=300&width=400",
      description: "Rumah sakit tipe B dengan standar internasional dan teknologi terkini",
      services: ["AutoCAD 2D", "RAB"],
    },
  ]

  return (
    <section id="portfolio" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Portfolio Terpilih</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Lihat berbagai proyek yang telah kami kerjakan dengan standar kualitas terbaik
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300">
              <div className="relative overflow-hidden">
                <img
                  src={project.image || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-blue-600">{project.category}</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.services.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors bg-transparent"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Lihat Detail
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline">
            Lihat Semua Portfolio
          </Button>
        </div>
      </div>
    </section>
  )
}
