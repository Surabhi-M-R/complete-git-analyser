"use client"

import React, { useEffect, useMemo, useRef } from "react"

type MatrixRainProps = {
  className?: string
  speed?: number // higher = faster
  density?: number // 0-1: fewer to more columns
  glow?: boolean
}

function MatrixRain({ className, speed = 1, density = 0.9, glow = true }: MatrixRainProps) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  // Katakana + ASCII for a "hacker terminal" vibe
  const charset = useMemo(
    () => "アカサタナハマヤラワ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+-*/=%\"'#&_(),.;:!?[]{}<>^~".split(""),
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d", { alpha: false })
    if (!ctx) return

    let width = 0
    let height = 0
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let running = !prefersReducedMotion

    // Column state
    let fontSize = 16
    let cols = 0
    let drops: number[] = []

    function initColumns() {
      fontSize = Math.max(14, Math.floor(Math.min(width, height) / 40))
      cols = Math.max(1, Math.floor((width / fontSize) * density))
      drops = new Array(cols).fill(0).map(() => Math.floor(Math.random() * -50))
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
    }

    function resize() {
      const { clientWidth, clientHeight } = canvas
      width = clientWidth
      height = clientHeight
      canvas.width = Math.floor(clientWidth * dpr)
      canvas.height = Math.floor(clientHeight * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = "#000000" // black canvas background
      ctx.fillRect(0, 0, width, height)
      initColumns()
    }

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)" // black fade trail
      ctx.fillRect(0, 0, width, height)

      // neon green glyphs
      ctx.fillStyle = "#00ff5f"
      if (glow) {
        ctx.shadowColor = "#000000"
        ctx.shadowBlur = 8
      } else {
        ctx.shadowBlur = 0
      }

      for (let i = 0; i < cols; i++) {
        const char = charset[Math.floor(Math.random() * charset.length)]
        const x = i * fontSize
        const y = drops[i] * fontSize
        ctx.fillText(char, x, y)

        if (y > height && Math.random() > 0.985) {
          drops[i] = Math.floor(Math.random() * -20)
        }
        drops[i] += Math.max(1, speed)
      }
    }

    function loop() {
      if (running) draw()
      rafRef.current = requestAnimationFrame(loop)
    }

    const onVisChange = () => {
      running = !document.hidden && !prefersReducedMotion
    }

    resize()
    window.addEventListener("resize", resize)
    document.addEventListener("visibilitychange", onVisChange)
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener("resize", resize)
      document.removeEventListener("visibilitychange", onVisChange)
    }
  }, [charset, density, speed, glow])

  return (
    <canvas
      ref={canvasRef}
      className={["absolute inset-0 h-full w-full", className].filter(Boolean).join(" ")}
      aria-hidden="true"
    />
  )
}

export default MatrixRain
export { MatrixRain }
