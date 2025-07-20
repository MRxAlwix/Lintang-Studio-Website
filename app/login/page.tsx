"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { Eye, EyeOff, ArrowLeft, LogIn, Loader2, AlertCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email wajib diisi"
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return "Format email tidak valid"
    return ""
  }

  const validatePassword = (password: string): string => {
    if (!password.trim()) return "Password wajib diisi"
    if (password.length < 6) return "Password minimal 6 karakter"
    return ""
  }

  const handleInputChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear previous errors
    setErrors((prev) => ({ ...prev, [field]: "" }))
    setLoginError(null)
  }

  const handleInputBlur = (field: "email" | "password") => {
    const value = formData[field]
    let error = ""

    if (field === "email") {
      error = validateEmail(value)
    } else if (field === "password") {
      error = validatePassword(value)
    }

    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  const validateForm = (): boolean => {
    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    setErrors({
      email: emailError,
      password: passwordError,
    })

    return !emailError && !passwordError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    if (!validateForm()) {
      toast({
        title: "Form tidak valid",
        description: "Mohon periksa kembali email dan password Anda",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Get user profile to check role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          console.error("Profile fetch error:", profileError)
        }

        toast({
          title: "Login berhasil",
          description: "Selamat datang kembali!",
        })

        // Redirect based on role
        if (profile?.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/")
        }
      }
    } catch (error: any) {
      console.error("Login error:", error)

      let errorMessage = "Terjadi kesalahan saat login"

      if (error.message?.includes("Invalid login credentials")) {
        errorMessage = "Email atau password salah"
      } else if (error.message?.includes("Email not confirmed")) {
        errorMessage = "Email belum diverifikasi. Silakan cek email Anda"
      } else if (error.message?.includes("Too many requests")) {
        errorMessage = "Terlalu banyak percobaan login. Coba lagi nanti"
      }

      setLoginError(errorMessage)
      toast({
        title: "Login gagal",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({
        title: "Email diperlukan",
        description: "Masukkan email Anda terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Email reset password terkirim",
        description: "Silakan cek email Anda untuk instruksi reset password",
      })
    } catch (error: any) {
      toast({
        title: "Gagal mengirim email reset",
        description: error.message || "Terjadi kesalahan sistem",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Beranda
        </Link>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <LogIn className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Masuk ke Akun</CardTitle>
            <CardDescription className="text-center">
              Masukkan email dan password untuk mengakses dashboard
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Login Error Alert */}
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@lintangstudio.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleInputBlur("email")}
                  className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    onBlur={() => handleInputBlur("password")}
                    className={errors.password ? "border-red-500 focus:border-red-500" : ""}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-sm text-red-500">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleForgotPassword}
                  disabled={isLoading}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Lupa password?
                </Button>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Demo Credentials:</p>
              <div className="text-xs space-y-1 text-muted-foreground">
                <p>
                  <strong>Admin:</strong> admin@lintangstudio.com / admin123
                </p>
                <p>
                  <strong>Client:</strong> client@example.com / client123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
