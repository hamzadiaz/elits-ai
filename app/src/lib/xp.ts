// ── XP & Leveling System for Elits AI ──
// Gamification layer: agents earn XP through training, actions, and usage

export interface AgentStats {
  xp: number
  level: number
  tier: string
  capabilities: {
    knowledge: number    // 0-100: based on training messages + knowledge graph
    communication: number // 0-100: based on style calibration + voice sessions
    actions: number       // 0-100: based on successful action executions
    trust: number         // 0-100: based on on-chain verification + turing test
    creativity: number    // 0-100: based on diversity of responses
  }
  streaks: {
    currentDays: number
    longestDays: number
    lastActiveDate: string
  }
  milestones: string[]
}

export const LEVEL_TIERS = [
  { min: 0, max: 99, name: 'Novice', color: '#6b7280' },
  { min: 100, max: 299, name: 'Apprentice', color: '#3b82f6' },
  { min: 300, max: 699, name: 'Skilled', color: '#8b5cf6' },
  { min: 700, max: 1499, name: 'Expert', color: '#f59e0b' },
  { min: 1500, max: 2999, name: 'Master', color: '#ef4444' },
  { min: 3000, max: Infinity, name: 'Elite', color: '#d4a017' },
] as const

export const XP_REWARDS = {
  createElit: 50,
  chatMessage: 5,
  voiceSession: 25,
  voiceMinute: 10,
  actionExecuted: 15,
  actionSuccess: 10,
  turingTestTaken: 20,
  turingTestFooled: 30,  // AI fooled the human
  onChainVerified: 100,
  onChainDelegation: 40,
  knowledgeAdded: 8,
  profileComplete: 30,
  firstTraining: 50,
  streak3Days: 25,
  streak7Days: 75,
  streak30Days: 200,
} as const

export const MILESTONES = [
  { id: 'first_words', name: 'First Words', description: 'Sent your first training message', xpReq: 0, icon: '💬' },
  { id: 'voice_trained', name: 'Voice Trained', description: 'Completed a voice training session', xpReq: 50, icon: '🎙️' },
  { id: 'on_chain', name: 'On-Chain', description: 'Verified your Elit on Solana', xpReq: 100, icon: '⛓️' },
  { id: 'action_hero', name: 'Action Hero', description: 'Executed 10 actions', xpReq: 200, icon: '⚡' },
  { id: 'turing_ready', name: 'Turing Ready', description: 'Passed the Turing Test', xpReq: 300, icon: '🧠' },
  { id: 'knowledge_base', name: 'Knowledge Base', description: 'Added 20+ knowledge entries', xpReq: 500, icon: '📚' },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Delegated to 3+ services', xpReq: 700, icon: '🦋' },
  { id: 'streak_master', name: 'Streak Master', description: '7-day training streak', xpReq: 1000, icon: '🔥' },
  { id: 'elite_status', name: 'Elite Status', description: 'Reached Elite tier', xpReq: 3000, icon: '👑' },
] as const

export function getLevel(xp: number): number {
  if (xp <= 0) return 1
  // Logarithmic scaling: level = floor(sqrt(xp / 10)) + 1, capped at 50
  return Math.min(50, Math.floor(Math.sqrt(xp / 10)) + 1)
}

export function getTier(xp: number): (typeof LEVEL_TIERS)[number] {
  return LEVEL_TIERS.find(t => xp >= t.min && xp <= t.max) || LEVEL_TIERS[0]
}

export function getXPForNextLevel(xp: number): { current: number; required: number; progress: number } {
  const currentLevel = getLevel(xp)
  const nextLevel = currentLevel + 1
  // Reverse the level formula: xp_for_level = (level - 1)^2 * 10
  const xpForCurrentLevel = (currentLevel - 1) ** 2 * 10
  const xpForNextLevel = nextLevel <= 50 ? (nextLevel - 1) ** 2 * 10 : Infinity
  const xpInCurrentLevel = xp - xpForCurrentLevel
  const xpNeeded = xpForNextLevel - xpForCurrentLevel
  return {
    current: xpInCurrentLevel,
    required: xpNeeded,
    progress: xpNeeded > 0 ? Math.min(1, xpInCurrentLevel / xpNeeded) : 1,
  }
}

export function calculateCapabilities(profile: {
  trainingMessages: unknown[]
  trainingSessions: unknown[]
  knowledgeGraph: unknown[]
  skills: string[]
  values: string[]
}): AgentStats['capabilities'] {
  const msgCount = profile.trainingMessages?.length || 0
  const sessionCount = profile.trainingSessions?.length || 0
  const knowledgeCount = profile.knowledgeGraph?.length || 0
  const skillCount = profile.skills?.length || 0
  const valueCount = profile.values?.length || 0

  return {
    knowledge: Math.min(100, Math.round(
      (knowledgeCount * 8) + (msgCount * 0.5) + (skillCount * 3)
    )),
    communication: Math.min(100, Math.round(
      (sessionCount * 10) + (msgCount * 1) + (valueCount * 4)
    )),
    actions: Math.min(100, Math.round(
      // Based on stored action count
      (parseInt(typeof window !== 'undefined' ? localStorage.getItem('elitActionCount') || '0' : '0')) * 5
    )),
    trust: Math.min(100, Math.round(
      (typeof window !== 'undefined' && localStorage.getItem('elitTxSignature') ? 50 : 0) +
      (typeof window !== 'undefined' && localStorage.getItem('elitHash') ? 30 : 0) +
      (skillCount > 3 ? 20 : skillCount * 5)
    )),
    creativity: Math.min(100, Math.round(
      (skillCount * 5) + (knowledgeCount * 3) + (msgCount * 0.3)
    )),
  }
}

export function calculateXP(profile: {
  trainingMessages: unknown[]
  trainingSessions: unknown[]
  knowledgeGraph: unknown[]
  skills: string[]
}): number {
  const msgCount = profile.trainingMessages?.length || 0
  const sessionCount = profile.trainingSessions?.length || 0
  const knowledgeCount = profile.knowledgeGraph?.length || 0

  let xp = 0
  xp += XP_REWARDS.createElit // Created an elit
  xp += msgCount * XP_REWARDS.chatMessage
  xp += sessionCount * XP_REWARDS.voiceSession
  xp += knowledgeCount * XP_REWARDS.knowledgeAdded

  // Check stored action count
  if (typeof window !== 'undefined') {
    const actionCount = parseInt(localStorage.getItem('elitActionCount') || '0')
    xp += actionCount * XP_REWARDS.actionExecuted
    if (localStorage.getItem('elitTxSignature')) xp += XP_REWARDS.onChainVerified
    if (localStorage.getItem('elitHash')) xp += XP_REWARDS.profileComplete
  }

  return xp
}

export function getUnlockedMilestones(xp: number, profile: {
  trainingMessages: unknown[]
  trainingSessions: unknown[]
}): typeof MILESTONES[number][] {
  const unlocked: typeof MILESTONES[number][] = []
  const msgCount = profile.trainingMessages?.length || 0
  const sessionCount = profile.trainingSessions?.length || 0

  if (msgCount > 0) unlocked.push(MILESTONES[0]) // first_words
  if (sessionCount > 0) unlocked.push(MILESTONES[1]) // voice_trained
  if (typeof window !== 'undefined' && localStorage.getItem('elitTxSignature')) unlocked.push(MILESTONES[2]) // on_chain

  // XP-based milestones
  for (const milestone of MILESTONES) {
    if (xp >= milestone.xpReq && !unlocked.find(u => u.id === milestone.id)) {
      unlocked.push(milestone)
    }
  }

  return unlocked
}

export function createEmptyStats(): AgentStats {
  return {
    xp: 0,
    level: 1,
    tier: 'Novice',
    capabilities: {
      knowledge: 0,
      communication: 0,
      actions: 0,
      trust: 0,
      creativity: 0,
    },
    streaks: {
      currentDays: 0,
      longestDays: 0,
      lastActiveDate: '',
    },
    milestones: [],
  }
}
