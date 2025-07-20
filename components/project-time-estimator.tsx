"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"

interface ProjectTimeEstimatorProps {
  serviceCategory: string
  area: number
  complexityFactor?: number
  className?: string
}

export function ProjectTimeEstimator({
  serviceCategory,
  area,
  complexityFactor = 1.0,
  className = "",
}: ProjectTimeEstimatorProps) {
  const [timeEstimate, setTimeEstimate] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (serviceCategory && area > 0) {
      calculateProjectTime()
    }
  }, [serviceCategory, area, complexityFactor])

  const calculateProjectTime = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/project-time/calculate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceCategory,
          area,
          complexityFactor,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setTimeEstimate(result)
      }
    } catch (error) {
      console.error("Error calculating project time:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!timeEstimate || loading) {
    return null
  }

  return (
    <div className={`bg-blue-50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Clock className="w-4 h-4 text-blue-600" />
        <span className="font-medium text-blue-900">Estimasi Waktu Pengerjaan</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-white">
            {timeEstimate.estimated_days} hari kerja
          </Badge>
        </div>

        <div className="flex items-center space-x-2 text-sm text-blue-700">
          <Calendar className="w-4 h-4" />
          <span>{timeEstimate.description}</span>
        </div>

        <p className="text-xs text-blue-600">*Estimasi berdasarkan kompleksitas proyek dan tidak termasuk hari libur</p>
      </div>
    </div>
  )
}
