import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

export function Testimonials() {
  const testimonials = [
    {
      name: "Budi Santoso",
      role: "Project Manager",
      company: "PT. Konstruksi Nusantara",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "Lintang Studio sangat profesional dalam menangani proyek kami. Hasil AutoCAD 2D dan 3D SketchUp sangat detail dan sesuai dengan kebutuhan konstruksi. Highly recommended!",
    },
    {
      name: "Sari Dewi",
      role: "Architect",
      company: "Studio Arsitektur Modern",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "Plugin AutoCAD dari Lintang Studio benar-benar meningkatkan produktivitas tim kami. Fitur auto dimensioning sangat membantu dalam proses drafting.",
    },
    {
      name: "Ahmad Rizki",
      role: "Developer",
      company: "Rizki Property",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "RAB yang dibuat sangat akurat dan detail. Membantu kami dalam perencanaan budget proyek perumahan. Pelayanan cepat dan hasil memuaskan.",
    },
    {
      name: "Maya Putri",
      role: "Interior Designer",
      company: "Maya Design Studio",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "Visualisasi 3D SketchUp yang dibuat sangat memukau dan membantu klien memahami konsep desain. Kualitas rendering sangat realistis.",
    },
    {
      name: "Doni Prasetyo",
      role: "Contractor",
      company: "CV. Bangun Jaya",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "Sudah bekerja sama selama 3 tahun. Selalu puas dengan hasil gambar kerja dan shop drawing. Tim yang sangat responsif dan profesional.",
    },
    {
      name: "Linda Sari",
      role: "Quantity Surveyor",
      company: "Konsultan QS Indonesia",
      avatar: "/placeholder.svg?height=60&width=60",
      rating: 5,
      content:
        "Plugin untuk perhitungan quantity sangat membantu pekerjaan saya. Akurasi tinggi dan menghemat waktu perhitungan manual.",
    },
  ]

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Apa Kata Klien Kami</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Kepercayaan dan kepuasan klien adalah prioritas utama kami
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>

                <div className="flex items-center">
                  <Avatar className="w-12 h-12 mr-4">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback>
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.company}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
