"use client"

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts"

type ChartPoint = { name: string; uses: number; discount: number }

export function CouponBarChart({ data }: { data: ChartPoint[] }) {
  if (data.length === 0) return null
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--color-text-muted, #888)" }} />
        <YAxis tick={{ fontSize: 11, fill: "var(--color-text-muted, #888)" }} />
        <Tooltip
          contentStyle={{ background: "var(--color-surface, #fff)", border: "1px solid var(--color-border, #ddd)", borderRadius: 12, fontSize: 12 }}
        />
        <Bar dataKey="uses" fill="var(--color-primary, #8b5e3c)" radius={[4, 4, 0, 0]} name="Uses" />
      </BarChart>
    </ResponsiveContainer>
  )
}
