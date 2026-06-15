"use client"

import { useEffect, useRef, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface ChartDataItem {
  name: string
  projected: number
  actual: number
}

export function CollectionChart({ data }: { data: ChartDataItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width)
      }
    })
    observer.observe(el)
    setWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  const hasData = data.some(d => d.projected > 0 || d.actual > 0)

  if (width === 0) return <div ref={containerRef} style={{ height: 250 }} />

  if (!hasData) {
    return (
      <div ref={containerRef} style={{ height: 250 }} className="flex items-center justify-center">
        <p className="text-muted-foreground text-sm">لا توجد بيانات متاحة بعد</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} style={{ height: 250 }}>
      <BarChart width={width} height={250} data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline-variant)" strokeOpacity={0.3} />
        <XAxis dataKey="name" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
        <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-surface-container-high)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            fontSize: "12px",
            color: "var(--color-on-surface)",
          }}
        />
        <Legend />
        <Bar dataKey="projected" name="المتوقع" fill="var(--color-muted-foreground)" fillOpacity={0.4} radius={[4, 4, 0, 0]} />
        <Bar dataKey="actual" name="المحصل" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </div>
  )
}
