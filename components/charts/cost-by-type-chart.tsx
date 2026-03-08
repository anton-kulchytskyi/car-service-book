'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Label } from 'recharts'
import { useTranslations } from 'next-intl'
import { SERVICE_TYPES } from '@/lib/constants'

type Props = {
  data: { type: string; total: number }[]
  total?: number
}

function getColor(i: number, total: number) {
  const hue = Math.round((i / total) * 360)
  return `hsl(${hue} 65% 55%)`
}

function fmt(n: number) {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export default function CostByTypeChart({ data, total }: Props) {
  const tPage = useTranslations('carPage')
  const tTypes = useTranslations('serviceTypes')

  function typeLabel(type: string) {
    return (SERVICE_TYPES as readonly string[]).includes(type)
      ? tTypes(type as typeof SERVICE_TYPES[number])
      : type
  }

  const translatedData = data.map((d) => ({ ...d, type: typeLabel(d.type) }))

  if (data.length === 0) return null

  return (
    <div className="rounded-lg border bg-muted/40 p-4 h-full flex flex-col">
      <p className="text-xs text-muted-foreground mb-3 font-medium">{tPage('costChartTitle')}</p>
      <div className="flex-1 min-h-45">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={translatedData}
              dataKey="total"
              nameKey="type"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="80%"
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={getColor(i, data.length)} />
              ))}
              {total != null && total > 0 && (
                <Label
                  content={({ viewBox }) => {
                    const { cx, cy } = viewBox as { cx: number; cy: number }
                    return (
                      <text textAnchor="middle" dominantBaseline="central">
                        <tspan x={cx} y={cy - 8} style={{ fontSize: 15, fontWeight: 700, fill: 'var(--foreground)' }}>
                          {fmt(total)}
                        </tspan>
                        <tspan x={cx} y={cy + 10} style={{ fontSize: 10, fill: 'var(--muted-foreground)' }}>
                          {tPage('costChartSpent')}
                        </tspan>
                      </text>
                    )
                  }}
                />
              )}
            </Pie>
            <Tooltip
              formatter={(value) => [`${fmt(Number(value))} UAH`, '']}
              contentStyle={{
                fontSize: 12,
                borderRadius: 6,
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
                color: 'var(--popover-foreground)',
              }}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span style={{ fontSize: 11, color: 'var(--muted-foreground)' }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
