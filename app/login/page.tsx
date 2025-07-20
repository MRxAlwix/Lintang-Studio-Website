"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/hooks/use-toast"
import { ValidatedInput, useFormValidation, validationRules } from "@/components/form-validation"
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface LoginFormData {
  email: string
  password: string
}

const validationSchema = {
  email: validationRules.email,
  password: { required: true, minLength: 1 },
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const { values, errors, touched, setValue, setFieldTouched, validateAll, reset } = useFormValidation<LoginFormData>(
    {
      email: "",
      password: "",
    },
    validationSchema,
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)

    if (!validateAll()) {
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
        email: values.email,
        password: values.password,
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
    if (!values.email) {
      toast({
        title: "Email diperlukan",
        description: "Masukkan email Anda terlebih dahulu",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
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
      <Card className="w-full max-w-md">
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
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            {/* Email Field */}
            <ValidatedInput
              id="email"
              label="Email"
              type="email"
              placeholder="admin@lintangstudio.com"
              value={values.email}
              onChange={(value) => setValue("email", value)}
              rules={validationRules.email}
            />

            {/* Password Field */}
            <div className="space-y-2">
              <ValidatedInput
                id="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password Anda"
                value={values.password}
                onChange={(value) => setValue("password", value)}
                rules={{ required: true, minLength: 1 }}
              />

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-1" />
                    Sembunyikan password
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-1" />
                    Tampilkan password
                  </>
                )}
              </Button>
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
  )
}
