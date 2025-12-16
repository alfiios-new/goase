import { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  connections: number[]
}

interface NeuralNode {
  x: number
  y: number
  targetX: number
  targetY: number
  pulse: number
  pulseSpeed: number
}

export default function AIAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const particlesRef = useRef<Particle[]>([])
  const nodesRef = useRef<NeuralNode[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const frameRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const updateDimensions = () => {
      const parent = canvas.parentElement
      if (parent) {
        const width = parent.clientWidth
        const height = parent.clientHeight
        setDimensions({ width, height })
        canvas.width = width
        canvas.height = height
        initParticles(width, height)
        initNeuralNodes(width, height)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('resize', updateDimensions)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const initParticles = (width: number, height: number) => {
    const particleCount = Math.min(50, Math.floor((width * height) / 8000))
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      connections: []
    }))
  }

  const initNeuralNodes = (width: number, height: number) => {
    const nodeCount = 8
    nodesRef.current = Array.from({ length: nodeCount }, (_, i) => {
      const angle = (i / nodeCount) * Math.PI * 2
      const radius = Math.min(width, height) * 0.25
      const centerX = width / 2
      const centerY = height / 2
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        targetX: centerX + Math.cos(angle) * radius,
        targetY: centerY + Math.sin(angle) * radius,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02
      }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const animate = () => {
      frameRef.current++
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      // Update and draw particles
      const particles = particlesRef.current
      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 100) {
          const force = (100 - dist) / 100
          particle.vx -= (dx / dist) * force * 0.2
          particle.vy -= (dy / dist) * force * 0.2
        }

        // Update position
        particle.x += particle.vx
        particle.y += particle.vy

        // Bounce off edges
        if (particle.x < 0 || particle.x > dimensions.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > dimensions.height) particle.vy *= -1

        // Friction
        particle.vx *= 0.99
        particle.vy *= 0.99

        // Draw particle
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, 3
        )
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw connections
        particles.forEach((otherParticle, j) => {
          if (i >= j) return
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 120) {
            const opacity = (1 - distance / 120) * 0.3
            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.stroke()
          }
        })
      })

      // Update and draw neural nodes
      const nodes = nodesRef.current
      const centerX = dimensions.width / 2
      const centerY = dimensions.height / 2

      nodes.forEach((node, i) => {
        // Update pulse
        node.pulse += node.pulseSpeed
        const pulseSize = 3 + Math.sin(node.pulse) * 2

        // Rotate nodes
        const angle = (i / nodes.length) * Math.PI * 2 + frameRef.current * 0.005
        const radius = Math.min(dimensions.width, dimensions.height) * 0.25
        node.targetX = centerX + Math.cos(angle) * radius
        node.targetY = centerY + Math.sin(angle) * radius

        // Smooth movement
        node.x += (node.targetX - node.x) * 0.05
        node.y += (node.targetY - node.y) * 0.05

        // Draw node glow
        const glowGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, pulseSize * 3
        )
        glowGradient.addColorStop(0, 'rgba(147, 51, 234, 0.6)')
        glowGradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.2)')
        glowGradient.addColorStop(1, 'rgba(147, 51, 234, 0)')
        
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize * 3, 0, Math.PI * 2)
        ctx.fill()

        // Draw node core
        ctx.fillStyle = 'rgba(147, 51, 234, 1)'
        ctx.beginPath()
        ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2)
        ctx.fill()

        // Draw connections between nodes
        const nextNode = nodes[(i + 1) % nodes.length]
        const gradient = ctx.createLinearGradient(
          node.x, node.y,
          nextNode.x, nextNode.y
        )
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.4)')
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)')
        gradient.addColorStop(1, 'rgba(147, 51, 234, 0.4)')

        ctx.strokeStyle = gradient
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(node.x, node.y)
        ctx.lineTo(nextNode.x, nextNode.y)
        ctx.stroke()

        // Draw data packets traveling along connections
        const packetPos = (frameRef.current * 0.01) % 1
        const packetX = node.x + (nextNode.x - node.x) * packetPos
        const packetY = node.y + (nextNode.y - node.y) * packetPos

        const packetGradient = ctx.createRadialGradient(
          packetX, packetY, 0,
          packetX, packetY, 4
        )
        packetGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        packetGradient.addColorStop(1, 'rgba(59, 130, 246, 0)')

        ctx.fillStyle = packetGradient
        ctx.beginPath()
        ctx.arc(packetX, packetY, 4, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw center AI core
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, 20
      )
      coreGradient.addColorStop(0, 'rgba(59, 130, 246, 0.8)')
      coreGradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.4)')
      coreGradient.addColorStop(1, 'rgba(147, 51, 234, 0)')

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 20, 0, Math.PI * 2)
      ctx.fill()

      // Draw rotating ring around core
      const ringRadius = 15 + Math.sin(frameRef.current * 0.05) * 3
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
      ctx.stroke()

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [dimensions])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    />
  )
}
