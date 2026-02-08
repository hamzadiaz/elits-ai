// Audio utilities for Gemini Live API

export function float32ToPcm16(float32: Float32Array): Int16Array {
  const pcm16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return pcm16
}

export function pcm16ToFloat32(pcm16: Int16Array): Float32Array {
  const float32 = new Float32Array(pcm16.length)
  for (let i = 0; i < pcm16.length; i++) {
    float32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff)
  }
  return float32
}

export function resample(input: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (inputRate === outputRate) return input
  const ratio = inputRate / outputRate
  const outputLength = Math.round(input.length / ratio)
  const output = new Float32Array(outputLength)
  for (let i = 0; i < outputLength; i++) {
    const srcIndex = i * ratio
    const floor = Math.floor(srcIndex)
    const ceil = Math.min(floor + 1, input.length - 1)
    const frac = srcIndex - floor
    output[i] = input[floor] * (1 - frac) + input[ceil] * frac
  }
  return output
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

function createAudioContext(sampleRate?: number): AudioContext {
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  return new AudioCtx(sampleRate ? { sampleRate } : undefined)
}

export class AudioCapture {
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private processorNode: ScriptProcessorNode | null = null
  private analyserNode: AnalyserNode | null = null
  private onAudioData: ((pcm16: ArrayBuffer) => void) | null = null
  private _isMuted = false

  get isMuted() { return this._isMuted }

  async start(onData: (pcm16: ArrayBuffer) => void): Promise<AnalyserNode | null> {
    this.onAudioData = onData
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 16000 },
    })
    this.audioContext = createAudioContext()
    this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)
    this.analyserNode = this.audioContext.createAnalyser()
    this.analyserNode.fftSize = 256
    this.analyserNode.smoothingTimeConstant = 0.8
    this.sourceNode.connect(this.analyserNode)
    this.processorNode = this.audioContext.createScriptProcessor(4096, 1, 1)
    this.processorNode.onaudioprocess = (event) => {
      if (this._isMuted || !this.onAudioData) return
      const inputData = event.inputBuffer.getChannelData(0)
      const resampled = resample(inputData, this.audioContext!.sampleRate, 16000)
      const pcm16 = float32ToPcm16(resampled)
      this.onAudioData(pcm16.buffer as ArrayBuffer)
    }
    this.sourceNode.connect(this.processorNode)
    this.processorNode.connect(this.audioContext.destination)
    return this.analyserNode
  }

  setMuted(muted: boolean) { this._isMuted = muted }

  stop() {
    this.processorNode?.disconnect()
    this.sourceNode?.disconnect()
    this.analyserNode?.disconnect()
    this.audioContext?.close()
    this.mediaStream?.getTracks().forEach(t => t.stop())
    this.audioContext = null
    this.mediaStream = null
    this.sourceNode = null
    this.processorNode = null
    this.analyserNode = null
    this.onAudioData = null
  }
}

export class AudioPlayer {
  private audioContext: AudioContext | null = null
  private analyserNode: AnalyserNode | null = null
  private nextPlayTime = 0
  private isPlaying = false
  private _onPlaybackStateChange: ((playing: boolean) => void) | null = null
  private activeSourceCount = 0

  set onPlaybackStateChange(cb: ((playing: boolean) => void) | null) { this._onPlaybackStateChange = cb }
  get analyser(): AnalyserNode | null { return this.analyserNode }

  private ensureContext() {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      this.audioContext = createAudioContext()
      this.analyserNode = this.audioContext.createAnalyser()
      this.analyserNode.fftSize = 256
      this.analyserNode.smoothingTimeConstant = 0.8
      this.analyserNode.connect(this.audioContext.destination)
      this.nextPlayTime = 0
    }
  }

  play(pcmData: ArrayBuffer, sampleRate = 24000) {
    this.ensureContext()
    const ctx = this.audioContext!
    if (ctx.state === 'suspended') ctx.resume()
    const int16 = new Int16Array(pcmData)
    const float32 = pcm16ToFloat32(int16)
    const audioBuffer = ctx.createBuffer(1, float32.length, sampleRate)
    audioBuffer.getChannelData(0).set(float32)
    const source = ctx.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.analyserNode!)
    const now = ctx.currentTime
    const startTime = Math.max(now, this.nextPlayTime)
    source.start(startTime)
    this.nextPlayTime = startTime + audioBuffer.duration
    this.activeSourceCount++
    if (!this.isPlaying) { this.isPlaying = true; this._onPlaybackStateChange?.(true) }
    source.onended = () => {
      this.activeSourceCount--
      if (this.activeSourceCount <= 0) { this.activeSourceCount = 0; this.isPlaying = false; this._onPlaybackStateChange?.(false) }
    }
  }

  stop() {
    this.audioContext?.close()
    this.audioContext = null
    this.analyserNode = null
    this.nextPlayTime = 0
    this.activeSourceCount = 0
    this.isPlaying = false
    this._onPlaybackStateChange?.(false)
  }

  flush() { this.nextPlayTime = 0 }
}
