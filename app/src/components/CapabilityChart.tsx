'use client'

import { motion } from 'framer-motion'
import type { AgentStats } from '@/lib/xp'

interface CapabilityChartProps {
  capabilities: AgentStats['capabilities']
  size?: number
  showLabels?: boolean
}

const CAPABILITY_META = [
  { key: 'knowledge' as const, label: 'Knowledge', icon: '📚', color: '#3b82f6' },
  { key: 'communication' as const, label: 'Communication', icon: '💬', color: '#8b5cf6' },
  { key: 'actions' as const, label: 'Actions', icon: '⚡', color: '#f59e0b' },
  { key: 'trust' as const, label: 'Trust', icon: '🛡️', color: '#10b981' },
  { key: 'creativity' as const, label: 'Creativity', icon: '✨', color: '#ec4899' },
]

export function CapabilityChart({ capabilities, size = 180, showLabels = true }: CapabilityChartProps) {
  const center = size / 2
  const maxRadius = size / 2 - 30
  const angleStep = (2 * Math.PI) / 5
  const startAngle = -Math.PI / 2 // Start from top

  // Calculate polygon points for the capability values
  const getPoint = (index: number, value: number): [number, number] => {
    const angle = startAngle + angleStep * index
    const radius = (value / 100) * maxRadius
    return [
      center + radius * Math.cos(angle),
      center + radius * Math.sin(angle),
    ]
  }

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [20, 40, 60, 80, 100]

  // Capability polygon points
  const points = CAPABILITY_META.map((cap, i) => getPoint(i, capabilities[cap.key]))
  const polygonPath = points.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid rings */}
        {gridLevels.map(level => {
          const gridPoints = CAPABILITY_META.map((_, i) => getPoint(i, level))
          return (
            <polygon
              key={level}
              points={gridPoints.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Axis lines */}
        {CAPABILITY_META.map((_, i) => {
          const [x, y] = getPoint(i, 100)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Capability fill */}
        <motion.polygon
          points={polygonPath}
          fill="rgba(212, 160, 23, 0.08)"
          stroke="rgba(212, 160, 23, 0.5)"
          strokeWidth="1.5"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
        />

        {/* Data points */}
        {points.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={3}
            fill={CAPABILITY_META[i].color}
            stroke="rgba(0,0,0,0.5)"
            strokeWidth="1"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * i, duration: 0.4 }}
          />
        ))}

        {/* Labels */}
        {showLabels && CAPABILITY_META.map((cap, i) => {
          const [x, y] = getPoint(i, 120)
          return (
            <text
              key={cap.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[9px] fill-white/40"
              fontFamily="Inter, sans-serif"
            >
              {cap.icon}
            </text>
          )
        })}
      </svg>

      {/* Legend */}
      {showLabels && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 w-full">
          {CAPABILITY_META.map(cap => (
            <div key={cap.key} className="text-center">
              <div className="text-[10px] font-medium" style={{ color: cap.color }}>
                {capabilities[cap.key]}%
              </div>
              <div className="text-[9px] text-white/30">{cap.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
