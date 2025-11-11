"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      })
      if (error) throw error
      if (data.user) {
        // Add a small delay to ensure session is established
        setTimeout(() => {
          router.push("/dashboard")
        }, 500)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer cadastro"
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
            <CardTitle className="text-3xl font-black text-gray-800">Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-5">
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
              <div>
                <Label htmlFor="password" className="text-gray-700 font-semibold text-sm">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 bg-gray-200 border-0 text-gray-600 placeholder-gray-400 rounded-lg py-3"
                />
              </div>
              <div>
                <Label htmlFor="repeat-password" className="text-gray-700 font-semibold text-sm">
                  Confirmar Senha
                </Label>
                <Input
                  id="repeat-password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="mt-2 bg-gray-200 border-0 text-gray-600 placeholder-gray-400 rounded-lg py-3"
                />
              </div>

              {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}

              <Button
                type="submit"
                className="w-full bg-yellow-300 hover:bg-yellow-400 text-gray-800 font-bold py-2 rounded-lg text-sm"
                disabled={isLoading}
              >
                {isLoading ? <Spinner /> : "Cadastrar"}
              </Button>

              <div className="text-center text-xs text-gray-600">
                <span>Já tem conta? </span>
                <Link href="/auth/login" className="text-green-600 font-bold hover:underline">
                  Faça login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
