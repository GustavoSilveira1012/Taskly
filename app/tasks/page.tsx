"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/sidebar"
import { TaskColumn } from "@/components/task-column"

interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "working" | "done"
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

 const loadTasks = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log("Usuário atual:", user, userError)

    if (!user) {
      console.error("Nenhum usuário autenticado. Faz login primeiro!")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })

    if (error) throw error
    console.log("Tarefas carregadas:", data)
    setTasks(data || [])
  } catch (error: any) {
    console.error("Error loading tasks:", error.message || error)
  } finally {
    setLoading(false)
  }
}

  const handleTaskDrop = (taskId: string, newStatus: string) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus as "todo" | "working" | "done" } : t)))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const todoTasks = tasks.filter((t) => t.status === "todo")
  const workingTasks = tasks.filter((t) => t.status === "working")
  const doneTasks = tasks.filter((t) => t.status === "done")

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #A8D8FF 0%, #E0C4FF 100%)" }}>
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Meus Projetos</h1>
          <p className="text-gray-600 mt-2">Organize suas tarefas por status</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-600 text-xl">Carregando tarefas...</p>
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-4">
            <TaskColumn
              title="TO-DO"
              status="todo"
              tasks={todoTasks}
              onTaskAdded={loadTasks}
              onTaskDrop={handleTaskDrop}
              color="bg-blue-300"
            />
            <TaskColumn
              title="Working"
              status="working"
              tasks={workingTasks}
              onTaskAdded={loadTasks}
              onTaskDrop={handleTaskDrop}
              color="bg-yellow-400"
            />
            <TaskColumn
              title="Done"
              status="done"
              tasks={doneTasks}
              onTaskAdded={loadTasks}
              onTaskDrop={handleTaskDrop}
              color="bg-green-300"
            />
          </div>
        )}
      </main>
    </div>
  )
}
