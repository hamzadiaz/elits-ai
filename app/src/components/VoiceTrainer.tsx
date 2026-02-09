'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react'
import { GeminiLiveClient, type ConnectionState } from '@/lib/voice/geminiLive'
import { AudioCapture, AudioPlayer } from '@/lib/voice/audio'
import { Avatar3D } from './Avatar3D'

interface TranscriptEntry {
  id: string
  speaker: 'user' | 'ai'
  text: string
}

interface VoiceTrainerProps {
  elitName: string
  avatarUrl?: string | null
  onTranscriptUpdate?: (entries: TranscriptEntry[]) => void
}

export function VoiceTrainer({ elitName, avatarUrl, onTranscriptUpdate }: VoiceTrainerProps) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isAiSpeaking, setIsAiSpeaking] = useState(false)
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [audioLevel, setAudioLevel] = useState(0)

  const clientRef = useRef<GeminiLiveClient | null>(null)
  const captureRef = useRef<AudioCapture | null>(null)
  const playerRef = useRef<AudioPlayer | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animFrameRef = useRef<number>(0)
  const transcriptEndRef = useRef<HTMLDivElement>(null)
  const isAiSpeakingRef = useRef(false)

  useEffect(() => { transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [transcript])
  useEffect(() => { onTranscriptUpdate?.(transcript) }, [transcript, onTranscriptUpdate])

  useEffect(() => {
    if (connectionState === 'connected' && !callTimerRef.current) {
      callTimerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000)
    }
    return () => { if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null } }
  }, [connectionState])

  useEffect(() => {
    const updateLevel = () => {
      if (analyserRef.current) {
        const data = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setAudioLevel(avg / 255)
        setIsUserSpeaking(avg / 255 > 0.05)
      }
      animFrameRef.current = requestAnimationFrame(updateLevel)
    }
    if (connectionState === 'connected') updateLevel()
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [connectionState])

  useEffect(() => { return () => { disconnect() } }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(async () => {
    try {
      const capture = new AudioCapture()
      const player = new AudioPlayer()
      captureRef.current = capture
      playerRef.current = player
      player.onPlaybackStateChange = (playing) => { setIsAiSpeaking(playing); isAiSpeakingRef.current = playing }

      const client = new GeminiLiveClient({})
      clientRef.current = client

      let currentUserTranscript = ''
      let currentAiTranscript = ''
      let userTimer: ReturnType<typeof setTimeout> | null = null
      let aiTimer: ReturnType<typeof setTimeout> | null = null

      const flushUser = () => {
        if (userTimer) clearTimeout(userTimer)
        if (currentUserTranscript.trim()) {
          const text = currentUserTranscript.trim()
          currentUserTranscript = ''
          setTranscript(prev => [...prev, { id: `user-${Date.now()}`, speaker: 'user', text }])
        }
      }
      const flushAi = () => {
        if (aiTimer) clearTimeout(aiTimer)
        if (currentAiTranscript.trim()) {
          const text = currentAiTranscript.trim()
          currentAiTranscript = ''
          setTranscript(prev => [...prev, { id: `ai-${Date.now()}`, speaker: 'ai', text }])
        }
      }

      client.on({
        onAudio: (pcmData) => player.play(pcmData, 24000),
        onTranscript: (text, isUser) => {
          if (isUser) {
            flushAi()
            currentUserTranscript += text
            if (userTimer) clearTimeout(userTimer)
            userTimer = setTimeout(flushUser, 1000)
          } else {
            const trimmed = text.trim()
            if (!trimmed) return
            // Filter thinking
            if (/^(Initiating|Acknowledging|Processing|I'll|I'm|I need|Let me|Now |Okay)/i.test(trimmed)) return
            flushUser()
            currentAiTranscript += text
            if (aiTimer) clearTimeout(aiTimer)
            aiTimer = setTimeout(flushAi, 800)
          }
        },
        onText: () => {},
        onConnectionChange: setConnectionState,
        onError: (err) => console.error('Gemini Live error:', err),
        onInterrupted: () => playerRef.current?.flush(),
      })

      await client.connect()

      const analyser = await capture.start((pcmData) => {
        client.sendAudio(pcmData)
      })
      if (analyser) analyserRef.current = analyser
    } catch (err) {
      console.error('Connection failed:', err)
      setConnectionState('error')
    }
  }, [])

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect(); clientRef.current = null
    captureRef.current?.stop(); captureRef.current = null
    playerRef.current?.stop(); playerRef.current = null
    analyserRef.current = null
    if (callTimerRef.current) { clearInterval(callTimerRef.current); callTimerRef.current = null }
    setConnectionState('disconnected')
    setIsAiSpeaking(false)
    setIsUserSpeaking(false)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(m => { captureRef.current?.setMuted(!m); return !m })
  }, [])

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

  const isActive = connectionState === 'connected'
  const avatarState = isAiSpeaking ? 'speaking' as const : isActive ? 'idle' as const : 'idle' as const

  return (
    <div className="flex flex-col items-center">
      {/* Start screen */}
      {!isActive && connectionState !== 'connecting' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
          <Avatar3D avatarUrl={avatarUrl} name={elitName} size="xl" state="idle" />
          <h3 className="text-xl font-bold gradient-text-white mt-6 mb-2">Call Your Elit</h3>
          <p className="text-white/35 text-[13px] mb-6 text-center max-w-xs font-light leading-relaxed">
            Have a voice conversation to teach your Elit who you are. The more you talk, the better it knows you.
          </p>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={connect}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 transition-transform"
          >
            <Phone className="w-7 h-7 text-white" />
          </motion.button>
          <p className="text-[11px] text-white/20 mt-3">Tap to start voice training</p>
        </motion.div>
      )}

      {/* Connecting */}
      {connectionState === 'connecting' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-12">
          <Avatar3D avatarUrl={avatarUrl} name={elitName} size="xl" state="thinking" />
          <p className="text-[13px] text-white/35 mt-6 font-light">Connecting...</p>
        </motion.div>
      )}

      {/* Active call */}
      {isActive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
          {/* Timer */}
          <p className="text-[13px] font-mono text-white/30 mb-4">{formatTime(callDuration)}</p>

          {/* Avatar */}
          <Avatar3D avatarUrl={avatarUrl} name={elitName} size="xl" state={avatarState} />

          {/* Status */}
          <AnimatePresence mode="wait">
            <motion.p
              key={isAiSpeaking ? 'ai' : isUserSpeaking ? 'user' : 'idle'}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[11px] text-white/30 mt-4 font-light"
            >
              {isAiSpeaking ? `${elitName}'s Elit is speaking...` : isUserSpeaking ? 'Listening to you...' : 'Listening...'}
            </motion.p>
          </AnimatePresence>

          {/* Transcript */}
          <div className="w-full mt-6 h-40 overflow-y-auto rounded-xl bg-white/[0.02] border border-white/[0.08] p-3">
            {transcript.length === 0 ? (
              <p className="text-[11px] text-white/20 text-center mt-12 font-light">Conversation will appear here...</p>
            ) : (
              <div className="space-y-2">
                {transcript.map(entry => (
                  <div key={entry.id} className={`flex gap-2 ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-1.5 rounded-xl text-[11px] ${
                      entry.speaker === 'user' ? 'bg-amber-500/[0.06] border border-amber-500/20 text-white/50' : 'bg-white/[0.04] border border-white/[0.06] text-white/35'
                    }`}>
                      <span className="font-medium text-[9px] block mb-0.5 text-white/25 uppercase tracking-wider">
                        {entry.speaker === 'user' ? 'You' : 'Elit'}
                      </span>
                      {entry.text}
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isMuted ? 'bg-red-500/[0.1] text-red-400/60 border border-red-500/20' : 'bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/60'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={disconnect}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Error */}
      {connectionState === 'error' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8">
          <PhoneOff className="w-10 h-10 text-red-400/50 mb-4" />
          <p className="text-[13px] text-white/35 mb-4 font-light">Connection failed. Check your microphone permissions.</p>
          <button onClick={connect} className="px-6 py-2.5 rounded-xl bg-amber-500/[0.08] text-amber-300/60 text-[12px] font-medium border border-amber-500/20 hover:bg-amber-500/[0.12] transition-colors cursor-pointer">
            Try Again
          </button>
        </motion.div>
      )}
    </div>
  )
}
