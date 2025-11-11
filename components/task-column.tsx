"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { AddTaskModal } from "./add-task-modal"

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "working" | "done"
}

interface TaskColumnProps {
  title: string
  status: "todo" | "working" | "done"
  tasks: Task[]
  onTaskAdded?: () => void
  onTaskDrop?: (taskId: string, newStatus: string) => void
  color: string
}

export function TaskColumn({ title, status, tasks, onTaskAdded, onTaskDrop, color }: TaskColumnProps) {
  const [newTask, setNewTask] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const supabase = createClient()

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    setIsAdding(true)
    try {
      const { error } = await supabase.from("tasks").insert({
        title: newTask,
        status,
        user_id: (await supabase.auth.getUser()).data.user?.id,
      })

      if (error) throw error
      setNewTask("")
      onTaskAdded?.()
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId)
      if (error) throw error
      onTaskAdded?.()
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)

    const taskId = e.dataTransfer.getData("taskId")
    if (taskId && onTaskDrop) {
      try {
        await supabase.from("tasks").update({ status }).eq("id", taskId)
        onTaskDrop(taskId, status)
      } catch (error) {
        console.error("Error moving task:", error)
      }
    }
  }

  return (
    <>
      <div className="flex-1 min-w-0">
        <div
          className={`${color} rounded-xl p-4 h-full flex flex-col`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            opacity: dragOver ? 0.9 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <h2 className="text-lg font-bold text-white mb-4">{title}</h2>

          <div className="flex-1 space-y-3 mb-4 overflow-y-auto">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="bg-white/90 p-3 rounded-lg cursor-move hover:shadow-lg transition-shadow"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move"
                  e.dataTransfer.setData("taskId", task.id)
                }}
              >
                <div className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1 flex-shrink-0" defaultChecked={status === "done"} />
                  <div className="flex-1">
                    <p className="text-gray-700 text-sm">{task.description || task.title}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-gray-800 font-bold px-4 py-2 rounded-lg hover:bg-white/90 w-full text-2xl"
          >
            +
          </button>
        </div>
      </div>

      <AddTaskModal
        isOpen={isModalOpen}
        status={status}
        onClose={() => setIsModalOpen(false)}
        onTaskAdded={() => {
          onTaskAdded?.()
          setIsModalOpen(false)
        }}
      />
    </>
  )
}
