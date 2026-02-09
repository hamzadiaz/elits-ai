'use client'

import { motion } from 'framer-motion'
import { getLevel, getTier } from '@/lib/xp'
import { Zap } from 'lucide-react'

interface LevelBadgeProps {
  xp: number
  size?: 'sm' | 'md' | 'lg'
  showTier?: boolean
}

const sizes = {
  sm: { badge: 'w-6 h-6', icon: 'w-2.5 h-2.5', text: 'text-[8px]', tierText: 'text-[9px]' },
  md: { badge: 'w-8 h-8', icon: 'w-3 h-3', text: 'text-[9px]', tierText: 'text-[10px]' },
  lg: { badge: 'w-10 h-10', icon: 'w-3.5 h-3.5', text: 'text-[10px]', tierText: 'text-[11px]' },
}

export function LevelBadge({ xp, size = 'md', showTier = false }: LevelBadgeProps) {
  const level = getLevel(xp)
  const tier = getTier(xp)
  const s = sizes[size]

  return (
    <div className="flex items-center gap-1.5">
      <motion.div
        className={`${s.badge} rounded-lg flex items-center justify-center relative overflow-hidden`}
        style={{
          background: `${tier.color}15`,
          border: `1px solid ${tier.color}30`,
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${tier.color}40, transparent)`,
          }}
        />
        <span className={`${s.text} font-bold relative z-10`} style={{ color: tier.color }}>
          {level}
        </span>
      </motion.div>
      {showTier && (
        <div className="flex items-center gap-1">
          <Zap className={s.icon} style={{ color: tier.color }} />
          <span className={`${s.tierText} font-medium`} style={{ color: tier.color }}>
            {tier.name}
          </span>
        </div>
      )}
    </div>
  )
}
