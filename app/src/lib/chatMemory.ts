const MAX_MESSAGES = 50
const STORAGE_PREFIX = 'elitChat_'

export interface ChatMessage {
  role: 'user' | 'elit'
  content: string
  timestamp?: number
}

export function loadChatHistory(agentId: string): ChatMessage[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${agentId}`)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveChatHistory(agentId: string, messages: ChatMessage[]) {
  if (typeof window === 'undefined') return
  try {
    // Keep only last MAX_MESSAGES
    const trimmed = messages.slice(-MAX_MESSAGES)
    localStorage.setItem(`${STORAGE_PREFIX}${agentId}`, JSON.stringify(trimmed))
  } catch {
    // localStorage full or disabled
  }
}

export function clearChatHistory(agentId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${agentId}`)
  } catch {}
}
