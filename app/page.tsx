"use client"

import { useState } from "react"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { Portfolio } from "@/components/portfolio"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { PriceCalculator } from "@/components/price-calculator"
import { OrderForm } from "@/components/order-form"

export default function HomePage() {
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const handleOrderClick = (service: any, area: number, totalPrice: number) => {
    setOrderData({ service, area, totalPrice })
    setShowOrderForm(true)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Services />
      <PriceCalculator onOrderClick={handleOrderClick} />
      <Portfolio />
      <Testimonials />
      <CTA />
      <Footer />

      {showOrderForm && (
        <OrderForm
          selectedService={orderData?.service}
          selectedArea={orderData?.area}
          estimatedPrice={orderData?.totalPrice}
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </div>
  )
}
