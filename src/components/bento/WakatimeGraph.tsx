'use client'

import React from 'react'
import { Bar, BarChart, Cell, LabelList, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { getLanguageIcon } from '@/components/bento/LanguageIcons'

type Row = {
  name: string
  hours: number
  fill: string
}

const DATA: Row[] = [
  { name: 'OpenAI', hours: 734, fill: 'hsl(var(--chart-1))' },
  { name: 'Gemini', hours: 670, fill: 'hsl(var(--chart-2))' },
  { name: 'Claude', hours: 411, fill: 'hsl(var(--chart-3))' },
  { name: 'Claude', hours: 184, fill: 'hsl(var(--chart-4))' },
  { name: 'Claude', hours: 137, fill: 'hsl(var(--chart-5))' },
  { name: 'Grok', hours: 102, fill: 'hsl(var(--chart-6))' },
  { name: 'DeepSeek', hours: 84, fill: 'hsl(var(--chart-7))' },
]

const chartConfig: ChartConfig = {
  hours: { label: 'Hours', color: 'var(--primary)' },
  label: { color: 'var(--muted-foreground)' },
}

const ICON_SIZE = 20
const BOX = 16

const CustomYAxisTick = ({ x, y, payload }: any) => {
  const icon = getLanguageIcon(payload.value, ICON_SIZE - 2)

  return (
    <g transform={`translate(${x - 20},${y})`}>
      <title>{payload.value}</title>

      {/* kotak belakang icon */}
      <rect
        x={-BOX}
        y={-BOX}
        width={BOX * 2}
        height={BOX * 2}
        fill="var(--border)"
        fillOpacity="0.5"
      />

      <foreignObject
        width={ICON_SIZE}
        height={ICON_SIZE}
        x={-ICON_SIZE / 2}
        y={-ICON_SIZE / 2}
      >
        <div className="flex h-full w-full items-center justify-center">
          {icon}
        </div>
      </foreignObject>
    </g>
  )
}

export default function WakatimeGraph() {
  return (
    <ChartContainer config={chartConfig} className="size-full p-4">
      <BarChart
        accessibilityLayer
        data={DATA}
        layout="vertical"
        margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
      >
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={45}
          tick={<CustomYAxisTick />}
        />
        <XAxis type="number" hide />

        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

        <Bar dataKey="hours" isAnimationActive={false} radius={[0, 0, 0, 0]}>
          {DATA.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}

          <LabelList
            dataKey="hours"
            position="right"
            formatter={(v: number) => `${Math.round(v)}h`}
            className="fill-foreground/80 font-medium"
            fontSize={13}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}
