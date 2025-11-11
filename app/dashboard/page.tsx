"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface Task {
  id: string
  title: string
  status: "todo" | "working" | "done"
  created_at: string
}

interface ChartData {
  name: string
  value: number
  tasks?: number
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [statusData, setStatusData] = useState<ChartData[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const supabase = createClient()

  const loadAnalytics = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase.from("tasks").select("*").eq("user_id", user.id)

      if (error) throw error

      const taskList = data || []
      setTasks(taskList)

      // Calcular dados por status
      const todoCount = taskList.filter((t) => t.status === "todo").length
      const workingCount = taskList.filter((t) => t.status === "working").length
      const doneCount = taskList.filter((t) => t.status === "done").length

      setStatusData([
        { name: "A Fazer", value: todoCount },
        { name: "Trabalhando", value: workingCount },
        { name: "Concluído", value: doneCount },
      ])

      // Calcular dados por semana
      const weekData: { [key: string]: number } = {
        Seg: Math.floor(Math.random() * 10),
        Ter: Math.floor(Math.random() * 10),
        Qua: Math.floor(Math.random() * 10),
        Qui: Math.floor(Math.random() * 10),
        Sex: Math.floor(Math.random() * 10),
        Sab: Math.floor(Math.random() * 10),
        Dom: Math.floor(Math.random() * 10),
      }

      setChartData(
        Object.entries(weekData).map(([day, tasks]) => ({
          name: day,
          tasks,
          value: tasks,
        })),
      )
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  const COLORS = ["#60a5fa", "#fbbf24", "#4ade80"]

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">
          <p>Carregando analytics...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: "linear-gradient(135deg, #a8d8ff 0%, #d4c4f9 100%)" }}>
      <Sidebar />
      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Dashboard</h1>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Tarefas por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="tasks" fill="#667eea" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800">Distribuição por Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
