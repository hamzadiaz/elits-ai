'use client'

import { motion } from 'framer-motion'
import { useState, useRef, useCallback } from 'react'

interface AvatarAngles {
  front: string
  left: string
  right: string
}

interface Avatar3DProps {
  avatarUrl?: string | null
  avatarAngles?: AvatarAngles | null
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

export function Avatar3D({ avatarUrl, avatarAngles, name, size = 'md', state = 'idle' }: Avatar3DProps) {
  const [imgError, setImgError] = useState(false)
  const [mouseX, setMouseX] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const s = sizes[size]
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  const hasImage = avatarUrl && !imgError
  const has3D = avatarAngles && avatarAngles.left && avatarAngles.right

  // Mouse tracking for 3D effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const normalizedX = (e.clientX - centerX) / (rect.width / 2) // -1 to 1
    setMouseX(Math.max(-1, Math.min(1, normalizedX)))
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseX(0) // Reset to front
  }, [])

  // Determine which image to show based on mouse position
  const getCurrentImage = () => {
    if (!has3D) return avatarUrl
    if (mouseX < -0.3) return avatarAngles.left
    if (mouseX > 0.3) return avatarAngles.right
    return avatarAngles.front
  }

  // Calculate CSS 3D transform based on mouse
  const get3DTransform = () => {
    if (!has3D) return {}
    return {
      transform: `perspective(600px) rotateY(${mouseX * 15}deg) rotateX(${-Math.abs(mouseX) * 3}deg)`,
      transition: 'transform 0.15s ease-out',
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
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
            ? 'radial-gradient(circle, rgba(212,160,23,0.4) 0%, transparent 70%)'
            : state === 'thinking'
              ? 'radial-gradient(circle, rgba(240,201,64,0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(212,160,23,0.15) 0%, transparent 70%)',
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

      {/* Main avatar container with 3D transform */}
      <motion.div
        className={`relative ${s.container} rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(212,160,23,0.2)] ${has3D ? 'cursor-grab' : ''}`}
        style={get3DTransform()}
        animate={
          state === 'idle' && !has3D
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
            src={getCurrentImage() || avatarUrl || ''}
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-dark to-blue flex items-center justify-center">
            <span className={`${s.text} font-bold text-white`}>{initial}</span>
          </div>
        )}

        {/* Holographic overlay with 3D-aware lighting */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={has3D ? {
            background: `linear-gradient(${90 + mouseX * 45}deg, rgba(212,160,23,${0.05 + Math.abs(mouseX) * 0.15}) 0%, transparent 50%, rgba(240,201,64,${0.05 + Math.abs(mouseX) * 0.1}) 100%)`,
          } : undefined}
          animate={!has3D ? {
            background: [
              'linear-gradient(135deg, rgba(212,160,23,0.1) 0%, transparent 50%, rgba(240,201,64,0.1) 100%)',
              'linear-gradient(225deg, rgba(212,160,23,0.1) 0%, transparent 50%, rgba(240,201,64,0.1) 100%)',
              'linear-gradient(135deg, rgba(212,160,23,0.1) 0%, transparent 50%, rgba(240,201,64,0.1) 100%)',
            ],
          } : undefined}
          transition={!has3D ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
        />

        {/* Scan line effect for 3D mode */}
        {has3D && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,160,23,0.1) 2px, rgba(212,160,23,0.1) 3px)',
            }} />
          </div>
        )}

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

      {/* 3D indicator */}
      {has3D && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-amber-400/40 font-mono tracking-wider">
          3D
        </div>
      )}
    </div>
  )
}
