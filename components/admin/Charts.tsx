"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts"

type RevenuePoint = { date: string; revenue: number; orders: number }
type MethodData = { name: string; orders: number; revenue: number }

const PIE_COLORS = ["#3b82f6", "#f97316"]

export function RevenueBarChart({ data }: { data: RevenuePoint[] }) {
  if (data.length === 0) {
    return <p className="text-text-muted text-sm">No revenue data yet</p>
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          tickFormatter={(v: string) => v.slice(5)}
          tick={{ fontSize: 11, fill: "var(--color-text-muted, #888)" }}
          interval="preserveStartEnd"
        />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted, #888)" }} />
        <Tooltip
          contentStyle={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #ddd)", borderRadius: 12, fontSize: 12 }}
          labelFormatter={(label) => `Date: ${label}`}
          formatter={(value) => [`EGP ${Number(value).toLocaleString()}`, "Revenue"]}
        />
        <Bar dataKey="revenue" fill="var(--color-primary, #8b5e3c)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function OrdersPieChart({ data }: { data: MethodData[] }) {
  if (data.length === 0) {
    return <p className="text-text-muted text-sm">No order data yet</p>
  }
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="orders"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #ddd)", borderRadius: 12, fontSize: 12 }}
          formatter={(value) => [value, "Orders"]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
