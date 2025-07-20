"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Validation rules
export const validationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Format email tidak valid",
  },
  phone: {
    pattern: /^(\+62|62|0)[0-9]{9,13}$/,
    message: "Nomor telepon harus format Indonesia (08xx atau +62)",
  },
  name: {
    pattern: /^[a-zA-Z\s]{2,50}$/,
    message: "Nama harus 2-50 karakter, hanya huruf dan spasi",
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
    message: "Password minimal 8 karakter, harus ada huruf besar, kecil, dan angka",
  },
  required: {
    pattern: /.+/,
    message: "Field ini wajib diisi",
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: "URL harus dimulai dengan http:// atau https://",
  },
  number: {
    pattern: /^\d+$/,
    message: "Hanya boleh angka",
  },
}

interface ValidationState {
  isValid: boolean
  message: string
  touched: boolean
}

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  validationType?: keyof typeof validationRules | "custom"
  customValidation?: (value: string) => { isValid: boolean; message: string }
  required?: boolean
  onValidationChange?: (isValid: boolean, message: string) => void
}

export function ValidatedInput({
  label,
  validationType,
  customValidation,
  required = false,
  onValidationChange,
  className,
  ...props
}: ValidatedInputProps) {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    message: "",
    touched: false,
  })

  const validateValue = (value: string) => {
    if (required && !value.trim()) {
      return { isValid: false, message: "Field ini wajib diisi" }
    }

    if (!value.trim()) {
      return { isValid: true, message: "" }
    }

    if (customValidation) {
      return customValidation(value)
    }

    if (validationType && validationRules[validationType]) {
      const rule = validationRules[validationType]
      const isValid = rule.pattern.test(value)
      return { isValid, message: isValid ? "" : rule.message }
    }

    return { isValid: true, message: "" }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const result = validateValue(e.target.value)
    setValidation({
      ...result,
      touched: true,
    })
    onValidationChange?.(result.isValid, result.message)
    props.onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (validation.touched) {
      const result = validateValue(e.target.value)
      setValidation({
        ...result,
        touched: true,
      })
      onValidationChange?.(result.isValid, result.message)
    }
    props.onChange?.(e)
  }

  const getValidationIcon = () => {
    if (!validation.touched) return null
    if (validation.isValid) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getInputClassName = () => {
    if (!validation.touched) return ""
    return validation.isValid ? "border-green-500 focus:border-green-500" : "border-red-500 focus:border-red-500"
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input {...props} onBlur={handleBlur} onChange={handleChange} className={cn(getInputClassName(), className)} />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getValidationIcon()}</div>
      </div>
      {validation.touched && validation.message && (
        <div className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-3 w-3" />
          {validation.message}
        </div>
      )}
    </div>
  )
}

interface ValidatedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  required?: boolean
  minLength?: number
  maxLength?: number
  onValidationChange?: (isValid: boolean, message: string) => void
}

export function ValidatedTextarea({
  label,
  required = false,
  minLength,
  maxLength,
  onValidationChange,
  className,
  ...props
}: ValidatedTextareaProps) {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    message: "",
    touched: false,
  })

  const validateValue = (value: string) => {
    if (required && !value.trim()) {
      return { isValid: false, message: "Field ini wajib diisi" }
    }

    if (minLength && value.length < minLength) {
      return { isValid: false, message: `Minimal ${minLength} karakter` }
    }

    if (maxLength && value.length > maxLength) {
      return { isValid: false, message: `Maksimal ${maxLength} karakter` }
    }

    return { isValid: true, message: "" }
  }

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const result = validateValue(e.target.value)
    setValidation({
      ...result,
      touched: true,
    })
    onValidationChange?.(result.isValid, result.message)
    props.onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (validation.touched) {
      const result = validateValue(e.target.value)
      setValidation({
        ...result,
        touched: true,
      })
      onValidationChange?.(result.isValid, result.message)
    }
    props.onChange?.(e)
  }

  const getTextareaClassName = () => {
    if (!validation.touched) return ""
    return validation.isValid ? "border-green-500 focus:border-green-500" : "border-red-500 focus:border-red-500"
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Textarea
        {...props}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(getTextareaClassName(), className)}
      />
      {maxLength && (
        <div className="text-xs text-gray-500 text-right">
          {props.value?.toString().length || 0}/{maxLength}
        </div>
      )}
      {validation.touched && validation.message && (
        <div className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-3 w-3" />
          {validation.message}
        </div>
      )}
    </div>
  )
}

interface ValidatedSelectProps {
  label: string
  required?: boolean
  value: string
  onValueChange: (value: string) => void
  onValidationChange?: (isValid: boolean, message: string) => void
  children: React.ReactNode
  placeholder?: string
}

export function ValidatedSelect({
  label,
  required = false,
  value,
  onValueChange,
  onValidationChange,
  children,
  placeholder,
}: ValidatedSelectProps) {
  const [validation, setValidation] = useState<ValidationState>({
    isValid: true,
    message: "",
    touched: false,
  })

  const validateValue = (value: string) => {
    if (required && !value) {
      return { isValid: false, message: "Pilihan ini wajib dipilih" }
    }
    return { isValid: true, message: "" }
  }

  const handleValueChange = (newValue: string) => {
    const result = validateValue(newValue)
    setValidation({
      ...result,
      touched: true,
    })
    onValidationChange?.(result.isValid, result.message)
    onValueChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className={cn(validation.touched && !validation.isValid && "border-red-500")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
      {validation.touched && validation.message && (
        <div className="flex items-center gap-1 text-sm text-red-500">
          <AlertCircle className="h-3 w-3" />
          {validation.message}
        </div>
      )}
    </div>
  )
}

// Hook for form validation
export function useFormValidation() {
  const [validationStates, setValidationStates] = useState<Record<string, boolean>>({})
  const [isFormValid, setIsFormValid] = useState(false)

  const updateValidation = (fieldName: string, isValid: boolean) => {
    setValidationStates((prev) => {
      const newStates = { ...prev, [fieldName]: isValid }
      const allValid = Object.values(newStates).every(Boolean)
      setIsFormValid(allValid)
      return newStates
    })
  }

  const resetValidation = () => {
    setValidationStates({})
    setIsFormValid(false)
  }

  return {
    validationStates,
    isFormValid,
    updateValidation,
    resetValidation,
  }
}
