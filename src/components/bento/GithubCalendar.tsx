'use client'
import { useEffect, useState } from 'react'

interface Props {
  username?: string
}

const AGENTS = [
  { name: 'REASO', symbol: 'R' },
  { name: 'EXECU', symbol: 'E' },
  { name: 'VALID', symbol: 'V' },
  { name: 'MEMOR', symbol: 'M' },
  { name: 'ORACL', symbol: 'O' },
]

const WIDTH = 50
const HEIGHT = 14
const COLOR = '#FFFFFF'  // Changed to white

type Message = {
  from: number
  to: number
  x: number
  char: string
}

type AgentState = {
  activity: number
  status: 'idle' | 'thinking' | 'active' | 'waiting'
}

type Task = {
  id: number
  progress: number
  agent: number
}

export default function GrisailleAgentViz(_props: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [agentStates, setAgentStates] = useState<AgentState[]>(
    AGENTS.map(() => ({ activity: 0, status: 'idle' }))
  )
  const [tasks, setTasks] = useState<Task[]>([])
  const [tick, setTick] = useState(0)
  const [cycle, setCycle] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      // Update messages
      setMessages((prev) => {
        const next = prev
          .map((m) => ({ ...m, x: m.x + 1 }))
          .filter((m) => m.x < WIDTH - 2)

        // Spawn new messages
        if (Math.random() > 0.6) {
          const from = Math.floor(Math.random() * AGENTS.length)
          let to = Math.floor(Math.random() * AGENTS.length)
          if (to === from) to = (to + 1) % AGENTS.length
          
          const chars = ['→', '⇒', '»', '▶']
          next.push({
            from,
            to,
            x: 14,
            char: chars[Math.floor(Math.random() * chars.length)]
          })
        }
        return next
      })

      // Update agent states
      setAgentStates((prev) =>
        prev.map((state, idx) => {
          const hasMessage = messages.some((m) => m.to === idx || m.from === idx)
          let newActivity = Math.max(0, state.activity - 5)
          let newStatus: AgentState['status'] = 'idle'

          if (hasMessage) {
            newActivity = Math.min(100, state.activity + 15)
            newStatus = 'active'
          } else if (state.activity > 30) {
            newStatus = 'thinking'
          }

          return { activity: newActivity, status: newStatus }
        })
      )

      // Update tasks
      setTasks((prev) => {
        const next = prev
          .map((t) => ({
            ...t,
            progress: Math.min(100, t.progress + Math.random() * 12)
          }))
          .filter((t) => t.progress < 100)

        // Spawn new task
        if (Math.random() > 0.85 && next.length < 2) {
          next.push({
            id: Date.now(),
            progress: 0,
            agent: Math.floor(Math.random() * AGENTS.length)
          })
        }
        return next
      })

      setTick((t) => t + 1)
      setCycle((c) => (c + 1) % 60)
    }, 120)

    return () => clearInterval(id)
  }, [messages, tick])

  // Create grid
  const grid: string[][] = []
  for (let i = 0; i < HEIGHT; i++) {
    const row: string[] = []
    for (let j = 0; j < WIDTH; j++) {
      row.push(' ')
    }
    grid.push(row)
  }

  // Header
  const title = 'GRISAILLE: AGENT COORDINATION'
  const headerStart = Math.floor((WIDTH - title.length) / 2)
  for (let i = 0; i < title.length && headerStart + i < WIDTH; i++) {
    grid[0][headerStart + i] = title[i]
  }

  // Draw agents
  AGENTS.forEach((agent, i) => {
    const y = i * 2 + 2
    if (y >= HEIGHT) return
    
    // Agent label: [R:REASO]
    const agentStr = `[${agent.symbol}:${agent.name}]`
    for (let j = 0; j < agentStr.length && j < WIDTH; j++) {
      grid[y][j] = agentStr[j]
    }
    
    // Activity bar
    const state = agentStates[i]
    const barChars = Math.floor((state.activity / 100) * 4)
    for (let j = 0; j < 4 && 10 + j < WIDTH; j++) {
      grid[y][10 + j] = j < barChars ? '█' : '░'
    }
    
    // Status dot
    if (15 < WIDTH) {
      grid[y][15] = state.status === 'active' ? '●' : 
                    state.status === 'thinking' ? '◐' : '○'
    }
  })

  // Draw messages
  messages.forEach((m) => {
    const yFrom = m.from * 2 + 2
    const yTo = m.to * 2 + 2
    const progress = (m.x - 14) / (WIDTH - 16)
    const y = Math.round(yFrom + ((yTo - yFrom) * progress))
    
    if (m.x >= 0 && m.x < WIDTH && y >= 0 && y < HEIGHT) {
      grid[y][m.x] = '─'
      if (m.x + 1 < WIDTH) {
        grid[y][m.x + 1] = m.char
      }
    }
  })

  // Draw task bars
  tasks.forEach((task) => {
    const y = task.agent * 2 + 2
    if (y >= HEIGHT) return
    
    const barLength = Math.floor((task.progress / 100) * 20)
    const startX = 18
    
    if (startX < WIDTH) {
      grid[y][startX] = '['
      for (let i = 0; i < 20 && startX + 1 + i < WIDTH; i++) {
        grid[y][startX + 1 + i] = i < barLength ? '█' : '░'
      }
      if (startX + 21 < WIDTH) {
        grid[y][startX + 21] = ']'
      }
      
      const label = ` T${task.id % 100}`
      for (let i = 0; i < label.length && startX + 22 + i < WIDTH; i++) {
        grid[y][startX + 22 + i] = label[i]
      }
    }
  })

  // Footer
  const footer = '─ neural coordination ─'
  const footerStart = Math.floor((WIDTH - footer.length) / 2)
  if (HEIGHT - 2 >= 0) {
    for (let i = 0; i < footer.length && footerStart + i < WIDTH; i++) {
      grid[HEIGHT - 2][footerStart + i] = footer[i]
    }
    
    // Heartbeat
    if (WIDTH - 2 >= 0) {
      grid[HEIGHT - 2][WIDTH - 2] = cycle < 30 ? '♥' : '♡'
    }
  }

  return (
    <div className="w-fit rounded-2xl bg-black p-4">
      <pre
        className="
          font-mono
          text-[11px]
          leading-[14px]
          tracking-tight
          select-none
        "
        style={{ color: COLOR }}
      >
        {grid.map((row, i) => (
          <div key={i}>{row.join('')}</div>
        ))}
      </pre>
      
      <div className="mt-2 text-xs text-foreground/50">
        background LLM coordination
      </div>
    </div>
  )
}