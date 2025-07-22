"use client"

import { useState } from "react"
import { SplashScreen } from "@/components/splash-screen"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { Portfolio } from "@/components/portfolio"
import { Testimonials } from "@/components/testimonials"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"
import { PriceCalculator } from "@/components/price-calculator"
import { OrderForm } from "@/components/order-form"

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderData, setOrderData] = useState<any>(null)

  const handleSplashComplete = () => {
    setShowSplash(false)
  }

  const handleOrderClick = (service: any, area: number, totalPrice: number) => {
    setOrderData({ service, area, totalPrice })
    setShowOrderForm(true)
  }

  const handleOrderFormClose = () => {
    setShowOrderForm(false)
    setOrderData(null)
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <Hero onOrderClick={() => setShowOrderForm(true)} />
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
          onClose={handleOrderFormClose}
        />
      )}
    </div>
  )
}
