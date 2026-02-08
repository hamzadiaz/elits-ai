'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface Avatar3DProps {
  avatarUrl?: string | null
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  state?: 'idle' | 'speaking' | 'thinking'
}

const sizes = {
  sm: { container: 'w-14 h-14', text: 'text-lg', ring: 'w-16 h-16' },
  md: { container: 'w-24 h-24', text: 'text-3xl', ring: 'w-28 h-28' },
  lg: { container: 'w-32 h-32', text: 'text-4xl', ring: 'w-36 h-36' },
  xl: { container: 'w-48 h-48', text: 'text-6xl', ring: 'w-52 h-52' },
}

export function Avatar3D({ avatarUrl, name, size = 'md', state = 'idle' }: Avatar3DProps) {
  const [imgError, setImgError] = useState(false)
  const s = sizes[size]
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  const hasImage = avatarUrl && !imgError

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow ring */}
      <motion.div
        className={`absolute ${s.ring} rounded-full`}
        animate={
          state === 'speaking'
            ? { scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }
            : state === 'thinking'
              ? { scale: [1, 1.08, 1], opacity: [0.3, 0.15, 0.3] }
              : { scale: [1, 1.03, 1], opacity: [0.2, 0.1, 0.2] }
        }
        transition={{
          duration: state === 'speaking' ? 0.8 : state === 'thinking' ? 1.2 : 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          background: state === 'speaking'
            ? 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)'
            : state === 'thinking'
              ? 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Second ring for speaking */}
      {state === 'speaking' && (
        <motion.div
          className={`absolute ${s.ring} rounded-full border border-primary/30`}
          animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
        />
      )}

      {/* Main avatar container */}
      <motion.div
        className={`relative ${s.container} rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(124,58,237,0.2)]`}
        animate={
          state === 'idle'
            ? { y: [0, -4, 0] }
            : state === 'speaking'
              ? { scale: [1, 1.03, 1] }
              : {}
        }
        transition={{
          duration: state === 'idle' ? 4 : 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {hasImage ? (
          <img
            src={avatarUrl}
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-dark to-blue flex items-center justify-center">
            <span className={`${s.text} font-bold text-white`}>{initial}</span>
          </div>
        )}

        {/* Holographic overlay */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          animate={{
            background: [
              'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, transparent 50%, rgba(59,130,246,0.1) 100%)',
              'linear-gradient(225deg, rgba(124,58,237,0.1) 0%, transparent 50%, rgba(59,130,246,0.1) 100%)',
              'linear-gradient(135deg, rgba(124,58,237,0.1) 0%, transparent 50%, rgba(59,130,246,0.1) 100%)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Thinking spinner */}
        {state === 'thinking' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
            <motion.div
              className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
