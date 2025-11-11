"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface AddTaskModalProps {
  isOpen: boolean
  status: "todo" | "working" | "done"
  onClose: () => void
  onTaskAdded: () => void
}

export function AddTaskModal({ isOpen, status, onClose, onTaskAdded }: AddTaskModalProps) {
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("tasks").insert({
        title: description,
        description: description,
        status,
        user_id: user.id,
      })

      if (error) throw error
      setDescription("")
      onTaskAdded()
      onClose()
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Adicionar Tarefa</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Descreva sua tarefa..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
            rows={4}
            disabled={isLoading}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-400 text-white rounded-lg font-semibold hover:bg-green-500 transition disabled:opacity-50"
              disabled={isLoading || !description.trim()}
            >
              {isLoading ? "Salvando..." : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
