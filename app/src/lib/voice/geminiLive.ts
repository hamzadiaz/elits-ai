// Gemini Live API client for Elits AI voice training

import { GoogleGenAI, Modality, StartSensitivity, EndSensitivity } from '@google/genai'
import type { Session, LiveServerMessage, LiveConnectConfig } from '@google/genai'
import { arrayBufferToBase64, base64ToArrayBuffer } from './audio'

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error'

interface GeminiLiveCallbacks {
  onAudio?: (pcmData: ArrayBuffer) => void
  onText?: (text: string) => void
  onTranscript?: (text: string, isUser: boolean) => void
  onConnectionChange?: (state: ConnectionState) => void
  onError?: (error: Error) => void
  onInterrupted?: () => void
}

export interface LiveConfig {
  systemPrompt?: string
  voice?: string
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const MODELS = ['gemini-2.5-flash-native-audio-latest', 'gemini-2.5-flash-native-audio-preview-12-2025']

export class GeminiLiveClient {
  private ai: GoogleGenAI
  private session: Session | null = null
  private callbacks: GeminiLiveCallbacks = {}
  private config: LiveConfig
  private _state: ConnectionState = 'disconnected'

  constructor(config: LiveConfig = {}) {
    if (!API_KEY) throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not set')
    this.ai = new GoogleGenAI({ apiKey: API_KEY })
    this.config = config
  }

  get state(): ConnectionState { return this._state }

  on(callbacks: GeminiLiveCallbacks) { this.callbacks = { ...this.callbacks, ...callbacks } }

  async connect(): Promise<void> {
    if (this.session) this.disconnect()
    this.setState('connecting')

    const liveConfig: LiveConnectConfig = {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        languageCode: 'en-US',
        voiceConfig: { prebuiltVoiceConfig: { voiceName: this.config.voice || 'Aoede' } },
      },
      systemInstruction: {
        parts: [{ text: this.config.systemPrompt || ELIT_TRAINER_PROMPT }],
      },
      thinkingConfig: { thinkingBudget: 0 },
      inputAudioTranscription: { languageCode: 'en-US' },
      outputAudioTranscription: { languageCode: 'en-US' },
      realtimeInputConfig: {
        automaticActivityDetection: {
          disabled: false,
          startOfSpeechSensitivity: StartSensitivity.START_SENSITIVITY_HIGH,
          endOfSpeechSensitivity: EndSensitivity.END_SENSITIVITY_HIGH,
        },
      },
    }

    let lastError: unknown
    for (const model of MODELS) {
      try {
        const setupPromise = new Promise<boolean>((resolve) => {
          let resolved = false
          this.session = null

          const connectPromise = this.ai.live.connect({
            model,
            config: liveConfig,
            callbacks: {
              onopen: () => {},
              onmessage: (message: LiveServerMessage) => {
                if (message.setupComplete && !resolved) { resolved = true; resolve(true) }
                this.handleMessage(message)
              },
              onerror: (e: ErrorEvent) => {
                if (!resolved) { resolved = true; resolve(false) }
                this.callbacks.onError?.(new Error(e.message || 'WebSocket error'))
              },
              onclose: (e: CloseEvent) => {
                this.session = null
                if (!resolved) { resolved = true; resolve(false) }
                if (this._state === 'connected') this.setState('disconnected')
              },
            },
          })
          connectPromise.then((session) => { this.session = session }).catch(() => { if (!resolved) { resolved = true; resolve(false) } })
          setTimeout(() => { if (!resolved) { resolved = true; resolve(false) } }, 8000)
        })

        const success = await setupPromise
        if (success && this.session) {
          this.setState('connected')
          return
        } else {
          if (this.session) { try { this.session.close() } catch {} this.session = null }
          lastError = new Error('setup failed')
        }
      } catch (err) { lastError = err }
    }
    this.setState('error')
    throw lastError
  }

  private isActive(): boolean { return this.session !== null && this._state === 'connected' }

  sendAudio(pcmData: ArrayBuffer): void {
    if (!this.isActive()) return
    try {
      this.session!.sendRealtimeInput({ media: { data: arrayBufferToBase64(pcmData), mimeType: 'audio/pcm;rate=16000' } })
    } catch (err) {
      if (String(err).includes('CLOS')) return
    }
  }

  sendText(text: string): void {
    if (!this.isActive()) return
    try {
      this.session!.sendClientContent({ turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true })
    } catch {}
  }

  disconnect(): void {
    if (this.session) { try { this.session.close() } catch {} this.session = null }
    this.setState('disconnected')
  }

  private setState(state: ConnectionState) { this._state = state; this.callbacks.onConnectionChange?.(state) }

  private handleMessage(message: LiveServerMessage) {
    if (message.setupComplete) return
    if (message.serverContent) {
      const content = message.serverContent
      if (content.interrupted) { this.callbacks.onInterrupted?.(); return }
      if (content.modelTurn?.parts) {
        for (const part of content.modelTurn.parts) {
          if (part.inlineData?.mimeType?.startsWith('audio/') && part.inlineData.data) {
            this.callbacks.onAudio?.(base64ToArrayBuffer(part.inlineData.data))
          }
          if (part.text) this.callbacks.onText?.(part.text)
        }
      }
      if (content.inputTranscription?.text) this.callbacks.onTranscript?.(content.inputTranscription.text, true)
      if (content.outputTranscription?.text) this.callbacks.onTranscript?.(content.outputTranscription.text, false)
    }
  }
}

const ELIT_TRAINER_PROMPT = `You are Gemini, an Elit Trainer for Elits AI. You interview users via voice to build their AI agent ("Elit").

CRITICAL VOICE RULES:
- Keep EVERY response to 1-2 sentences MAX. This is a phone call.
- Ask ONE question at a time, then STOP and WAIT for the user to respond.
- NEVER keep talking after asking a question. Say your piece, then silence.
- Speak in English only.

CONVERSATION FLOW:
1. Greet warmly, ask their name
2. Ask about their professional skills/expertise
3. Ask about interests and passions
4. Ask about communication style preferences
5. Ask about values and personality
6. After 5-8 exchanges, summarize what you learned

STYLE:
- Natural phone call energy, not robotic
- Mirror their tone
- Show genuine curiosity
- Be warm but concise`
