'use client'

import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, ExternalLink, X } from 'lucide-react'
import { explorerUrl } from '@/lib/solana'

interface Toast {
  id: string
  type: 'success' | 'error' | 'loading'
  message: string
  txSignature?: string
  duration?: number
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Omit<Toast, 'id'>>) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setToasts(prev => [...prev, { ...toast, id }])

    if (toast.type !== 'loading' && toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, toast.duration || 5000)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))

    if (updates.type && updates.type !== 'loading') {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, updates.duration || 5000)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast, updateToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto"
            >
              <div className={`flex items-start gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border shadow-2xl max-w-sm ${
                toast.type === 'success'
                  ? 'bg-emerald-400/[0.06] border-emerald-400/[0.15]'
                  : toast.type === 'error'
                    ? 'bg-red-400/[0.06] border-red-400/[0.15]'
                    : 'bg-white/[0.06] border-white/[0.1]'
              }`}>
                {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400/70 shrink-0 mt-0.5" />}
                {toast.type === 'error' && <XCircle className="w-4 h-4 text-red-400/70 shrink-0 mt-0.5" />}
                {toast.type === 'loading' && <Loader2 className="w-4 h-4 text-amber-300/60 shrink-0 mt-0.5 animate-spin" />}

                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-white/60 font-medium">{toast.message}</p>
                  {toast.txSignature && (
                    <a
                      href={explorerUrl(toast.txSignature)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 mt-1 text-[10px] text-amber-300/50 hover:text-amber-300/70 transition-colors font-mono"
                    >
                      {toast.txSignature.slice(0, 16)}...
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-white/20 hover:text-white/40 transition-colors shrink-0 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
