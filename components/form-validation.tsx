"use client"

import { useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

// Validation rules
export const validationRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Format email tidak valid",
  },
  phone: {
    required: true,
    pattern: /^(\+62|62|0)[0-9]{9,13}$/,
    message: "Format nomor telepon tidak valid (contoh: 08123456789)",
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: "Nama hanya boleh berisi huruf dan spasi",
  },
  password: {
    required: true,
    minLength: 6,
    message: "Password minimal 6 karakter",
  },
  text: {
    required: true,
    minLength: 1,
    maxLength: 1000,
  },
  number: {
    required: true,
    pattern: /^\d+$/,
    message: "Hanya boleh berisi angka",
  },
  url: {
    pattern: /^https?:\/\/.+/,
    message: "URL harus dimulai dengan http:// atau https://",
  },
}

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
  custom?: (value: string) => string | null
}

interface ValidatedInputProps {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rules: ValidationRule
  disabled?: boolean
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
  disabled = false,
  className = "",
}: ValidatedInputProps) {
  const [touched, setTouched] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateValue = useCallback(
    (val: string): string | null => {
      if (rules.required && !val.trim()) {
        return `${label} wajib diisi`
      }

      if (val && rules.minLength && val.length < rules.minLength) {
        return `${label} minimal ${rules.minLength} karakter`
      }

      if (val && rules.maxLength && val.length > rules.maxLength) {
        return `${label} maksimal ${rules.maxLength} karakter`
      }

      if (val && rules.pattern && !rules.pattern.test(val)) {
        return rules.message || `Format ${label} tidak valid`
      }

      if (val && rules.custom) {
        return rules.custom(val)
      }

      return null
    },
    [label, rules],
  )

  const error = validateValue(value)
  const isValid = touched && !error && value.trim() !== ""
  const hasError = touched && error

  const handleBlur = () => {
    setTouched(true)
  }

  const inputType = type === "password" && showPassword ? "text" : type

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {rules.required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          className={`pr-10 ${
            hasError ? "border-red-500 focus:border-red-500" : isValid ? "border-green-500 focus:border-green-500" : ""
          }`}
        />

        {/* Password toggle */}
        {type === "password" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={disabled}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}

        {/* Validation icons */}
        {type !== "password" && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
            {isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Character count for text inputs */}
      {rules.maxLength && value && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{rules.maxLength}
        </div>
      )}
    </div>
  )
}

interface ValidatedTextareaProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  rules: ValidationRule
  disabled?: boolean
  rows?: number
  className?: string
}

export function ValidatedTextarea({
  id,
  label,
  placeholder,
  value,
  onChange,
  rules,
  disabled = false,
  rows = 4,
  className = "",
}: ValidatedTextareaProps) {
  const [touched, setTouched] = useState(false)

  const validateValue = useCallback(
    (val: string): string | null => {
      if (rules.required && !val.trim()) {
        return `${label} wajib diisi`
      }

      if (val && rules.minLength && val.length < rules.minLength) {
        return `${label} minimal ${rules.minLength} karakter`
      }

      if (val && rules.maxLength && val.length > rules.maxLength) {
        return `${label} maksimal ${rules.maxLength} karakter`
      }

      if (val && rules.custom) {
        return rules.custom(val)
      }

      return null
    },
    [label, rules],
  )

  const error = validateValue(value)
  const isValid = touched && !error && value.trim() !== ""
  const hasError = touched && error

  const handleBlur = () => {
    setTouched(true)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {rules.required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative">
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          disabled={disabled}
          rows={rows}
          className={`resize-none ${
            hasError ? "border-red-500 focus:border-red-500" : isValid ? "border-green-500 focus:border-green-500" : ""
          }`}
        />
        <div className="absolute right-3 top-3">
          {hasError && <AlertCircle className="h-4 w-4 text-red-500" />}
          {isValid && <CheckCircle className="h-4 w-4 text-green-500" />}
        </div>
      </div>

      {/* Error message */}
      {hasError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {/* Character count */}
      {rules.maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{rules.maxLength}
        </div>
      )}
    </div>
  )
}

interface ValidatedSelectProps {
  id: string
  label: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  rules: ValidationRule
  disabled?: boolean
  className?: string
}

export function ValidatedSelect({
  id,
  label,
  placeholder = "Pilih opsi",
  value,
  onChange,
  options,
  rules,
  disabled = false,
  className = "",
}: ValidatedSelectProps) {
  const [touched, setTouched] = useState(false)

  const validateValue = useCallback(
    (val: string): string | null => {
      if (rules.required && !val) {
        return `${label} wajib dipilih`
      }
      return null
    },
    [label, rules],
  )

  const error = validateValue(value)
  const isValid = touched && !error && value !== ""
  const hasError = touched && error

  const handleValueChange = (newValue: string) => {
    onChange(newValue)
    setTouched(true)
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {rules.required && <span className="text-red-500">*</span>}
      </Label>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger
          className={
            hasError ? "border-red-500 focus:border-red-500" : isValid ? "border-green-500 focus:border-green-500" : ""
          }
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Error message */}
      {hasError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Form validation hook
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  validationSchema: Record<keyof T, ValidationRule>,
) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})

  const validateField = useCallback(
    (field: keyof T, value: any): string | null => {
      const rules = validationSchema[field]
      if (!rules) return null

      if (rules.required && (!value || value.toString().trim() === "")) {
        return `${String(field)} wajib diisi`
      }

      if (value && rules.minLength && value.toString().length < rules.minLength) {
        return `${String(field)} minimal ${rules.minLength} karakter`
      }

      if (value && rules.maxLength && value.toString().length > rules.maxLength) {
        return `${String(field)} maksimal ${rules.maxLength} karakter`
      }

      if (value && rules.pattern && !rules.pattern.test(value.toString())) {
        return rules.message || `Format ${String(field)} tidak valid`
      }

      if (value && rules.custom) {
        return rules.custom(value.toString())
      }

      return null
    },
    [validationSchema],
  )

  const setValue = useCallback((field: keyof T, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }, [])

  const setFieldTouched = useCallback(
    (field: keyof T, isTouched = true) => {
      setTouched((prev) => ({ ...prev, [field]: isTouched }))

      // Validate field when touched
      if (isTouched) {
        const error = validateField(field, values[field])
        setErrors((prev) => ({ ...prev, [field]: error || undefined }))
      }
    },
    [validateField, values],
  )

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    const newTouched: Partial<Record<keyof T, boolean>> = {}

    let isValid = true

    Object.keys(validationSchema).forEach((field) => {
      const fieldKey = field as keyof T
      const error = validateField(fieldKey, values[fieldKey])

      newTouched[fieldKey] = true

      if (error) {
        newErrors[fieldKey] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    setTouched(newTouched)

    return isValid
  }, [validateField, validationSchema, values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  }
}
