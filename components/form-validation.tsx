"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: string) => string | null
}

interface ValidatedInputProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rules?: ValidationRule
  className?: string
}

export function ValidatedInput({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  rules,
  className,
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateValue = (val: string): string | null => {
    if (!rules) return null

    if (rules.required && !val.trim()) {
      return "Field ini wajib diisi"
    }

    if (rules.minLength && val.length < rules.minLength) {
      return `Minimal ${rules.minLength} karakter`
    }

    if (rules.maxLength && val.length > rules.maxLength) {
      return `Maksimal ${rules.maxLength} karakter`
    }

    if (rules.pattern && !rules.pattern.test(val)) {
      if (type === "email") {
        return "Format email tidak valid"
      }
      if (type === "tel") {
        return "Format nomor telepon tidak valid"
      }
      return "Format tidak valid"
    }

    if (rules.custom) {
      return rules.custom(val)
    }

    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    if (touched) {
      const validationError = validateValue(newValue)
      setError(validationError)
    }
  }

  const handleBlur = () => {
    setTouched(true)
    const validationError = validateValue(value)
    setError(validationError)
  }

  const isValid = touched && !error && value.trim()
  const hasError = touched && error

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {rules?.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "transition-colors duration-200",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
            isValid && "border-green-500 focus:border-green-500 focus:ring-green-500",
            className,
          )}
        />

        {/* Validation Icons */}
        {touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {error ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : value.trim() ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Validation utilities
export const validationRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    required: true,
    pattern: /^(\+62|62|0)[0-9]{9,13}$/,
    custom: (value: string) => {
      const cleaned = value.replace(/\D/g, "")
      if (cleaned.length < 10) return "Nomor telepon terlalu pendek"
      if (cleaned.length > 15) return "Nomor telepon terlalu panjang"
      return null
    },
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (!/(?=.*[a-z])/.test(value)) return "Harus mengandung huruf kecil"
      if (!/(?=.*[A-Z])/.test(value)) return "Harus mengandung huruf besar"
      if (!/(?=.*\d)/.test(value)) return "Harus mengandung angka"
      return null
    },
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s]+$/,
    custom: (value: string) => {
      if (value.trim().split(" ").length < 2) return "Masukkan nama lengkap"
      return null
    },
  },
  text: {
    required: true,
    minLength: 1,
    maxLength: 500,
  },
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, ValidationRule>,
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = (name: keyof T, value: any): string | null => {
    const rules = validationSchema[name]
    if (!rules) return null

    const stringValue = String(value || "")

    if (rules.required && !stringValue.trim()) {
      return "Field ini wajib diisi"
    }

    if (rules.minLength && stringValue.length < rules.minLength) {
      return `Minimal ${rules.minLength} karakter`
    }

    if (rules.maxLength && stringValue.length > rules.maxLength) {
      return `Maksimal ${rules.maxLength} karakter`
    }

    if (rules.pattern && !rules.pattern.test(stringValue)) {
      return "Format tidak valid"
    }

    if (rules.custom) {
      return rules.custom(stringValue)
    }

    return null
  }

  const setValue = (name: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const setFieldTouched = (name: keyof T) => {
    setTouched((prev) => ({ ...prev, [name]: true }))
    const error = validateField(name, values[name])
    setErrors((prev) => ({ ...prev, [name]: error }))
  }

  const validateAll = (): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    let isValid = true

    Object.keys(validationSchema).forEach((key) => {
      const fieldName = key as keyof T
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(Object.keys(validationSchema).reduce((acc, key) => ({ ...acc, [key]: true }), {}))

    return isValid
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0 && Object.keys(touched).length > 0,
  }
}
