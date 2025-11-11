"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccessOpen, setIsSuccessOpen] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setIsSuccessOpen(true)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao enviar link de reset"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div
        className="w-1/3 flex flex-col items-center justify-center p-8"
        style={{ background: "linear-gradient(135deg, #5B7FFF 0%, #7D5FFF 50%)" }}
      >
        <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-lg">
          ✓
        </div>
        <h1 className="text-white text-3xl font-bold">Taskly</h1>
      </div>

      <div
        className="w-2/3 flex items-center justify-center p-4"
        style={{ background: "linear-gradient(135deg, #A8A5FF 0%, #D4A5FF 100%)" }}
      >
        <Card className="bg-gradient-to-br from-yellow-50 to-green-50 border-4 border-yellow-200 rounded-3xl shadow-xl w-full max-w-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-black text-gray-800">Esqueci a Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-semibold text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 bg-gray-200 border-0 text-gray-600 placeholder-gray-400 rounded-lg py-3"
                />
              </div>

              {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1 bg-green-400 hover:bg-green-500 text-gray-800 font-bold py-2 rounded-lg text-sm"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner /> : "Entrar"}
                </Button>
              </div>

              <div className="text-center text-xs text-gray-600 pt-1">
                <Link href="/auth/login" className="text-green-600 font-bold hover:underline">
                  Voltar ao Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Modal de Sucesso */}
        {isSuccessOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            style={{ background: "linear-gradient(135deg, #A8A5FF 0%, #D4A5FF 100%)" }}
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative">
              <button
                onClick={() => setIsSuccessOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>

              <div className="text-center">
                <div className="text-5xl mb-4">⭐</div>
                <h2 className="text-3xl font-black text-orange-500 mb-4">NICE</h2>

                <div className="space-y-3 text-left">
                  <p className="text-gray-800 font-semibold">Tudo certo!</p>
                  <p className="text-gray-600 text-sm">
                    Email enviado para:
                    <br />
                    <span className="font-semibold text-gray-800">{email}</span>
                  </p>
                  <p className="text-gray-600 text-sm">Aguarde para nova senha</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
