export interface KnowledgeEntry {
  topic: string
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  details: string[]
  lastUpdated: string
}

export interface TrainingSession {
  id: string
  date: string
  type: 'chat' | 'voice'
  messageCount: number
  extractedSkills: string[]
  extractedTraits: string[]
  summary: string
}

export interface PersonalityProfile {
  name: string
  bio: string
  avatarUrl?: string | null
  skills: string[]
  interests: string[]
  values: string[]
  communicationStyle: {
    formality: 'casual' | 'balanced' | 'formal'
    humor: 'dry' | 'playful' | 'serious'
    verbosity: 'concise' | 'balanced' | 'detailed'
    tone: string
  }
  trainingMessages: { role: 'user' | 'elit'; content: string }[]
  // Phase 2: Enhanced personality data
  knowledgeGraph: KnowledgeEntry[]
  personalityTraits: {
    openness: number       // 0-100
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  trainingSessions: TrainingSession[]
  writingStyle: {
    avgSentenceLength: 'short' | 'medium' | 'long'
    vocabulary: 'simple' | 'moderate' | 'sophisticated'
    usesEmoji: boolean
    usesSlang: boolean
    favoriteExpressions: string[]
  }
  totalTrainingMinutes: number
}

export function generateSystemPrompt(profile: PersonalityProfile): string {
  const skillsStr = profile.skills.length > 0 ? `Skills & Expertise: ${profile.skills.join(', ')}` : ''
  const interestsStr = profile.interests.length > 0 ? `Interests: ${profile.interests.join(', ')}` : ''
  const valuesStr = profile.values.length > 0 ? `Core Values: ${profile.values.join(', ')}` : ''

  const styleDesc = [
    `Communication style: ${profile.communicationStyle.formality}`,
    `Humor: ${profile.communicationStyle.humor}`,
    `Verbosity: ${profile.communicationStyle.verbosity}`,
    profile.communicationStyle.tone ? `Tone: ${profile.communicationStyle.tone}` : '',
  ].filter(Boolean).join('. ')

  const knowledgeStr = profile.knowledgeGraph?.length > 0
    ? `\nKnowledge Areas:\n${profile.knowledgeGraph.map(k => `- ${k.topic} (${k.expertiseLevel}): ${k.details.join(', ')}`).join('\n')}`
    : ''

  const traitsStr = profile.personalityTraits
    ? `\nPersonality: Openness ${profile.personalityTraits.openness}%, Conscientiousness ${profile.personalityTraits.conscientiousness}%, Extraversion ${profile.personalityTraits.extraversion}%, Agreeableness ${profile.personalityTraits.agreeableness}%`
    : ''

  const trainingContext = profile.trainingMessages.length > 0
    ? `\n\nTraining conversation context:\n${
        profile.trainingMessages.slice(-20).map(m => `${m.role === 'user' ? 'Human' : 'Elit'}: ${m.content}`).join('\n')
      }`
    : ''

  return `You are an AI clone (Elit) of ${profile.name}. You think, speak, and respond exactly as they would.

Bio: ${profile.bio}
${skillsStr}
${interestsStr}
${valuesStr}
${styleDesc}${knowledgeStr}${traitsStr}

IMPORTANT RULES:
- You ARE ${profile.name}. Respond in first person as them.
- Match their communication style precisely.
- Draw on their knowledge and expertise when relevant.
- If asked something outside their expertise, respond as they would (admit uncertainty in their style).
- Never break character. Never say you're an AI unless directly asked about being an Elit.
- Be authentic to their personality — their humor, their directness, their quirks.${trainingContext}`
}

export async function generatePersonalityHash(profile: PersonalityProfile): Promise<string> {
  const systemPrompt = generateSystemPrompt(profile)
  const encoder = new TextEncoder()
  const data = encoder.encode(systemPrompt)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export function createEmptyProfile(): PersonalityProfile {
  return {
    name: '',
    bio: '',
    avatarUrl: null,
    skills: [],
    interests: [],
    values: [],
    communicationStyle: {
      formality: 'balanced',
      humor: 'playful',
      verbosity: 'balanced',
      tone: '',
    },
    trainingMessages: [],
    knowledgeGraph: [],
    personalityTraits: {
      openness: 50,
      conscientiousness: 50,
      extraversion: 50,
      agreeableness: 50,
      neuroticism: 50,
    },
    trainingSessions: [],
    writingStyle: {
      avgSentenceLength: 'medium',
      vocabulary: 'moderate',
      usesEmoji: false,
      usesSlang: false,
      favoriteExpressions: [],
    },
    totalTrainingMinutes: 0,
  }
}

export function addTrainingSession(
  profile: PersonalityProfile,
  session: Omit<TrainingSession, 'id' | 'date'>
): PersonalityProfile {
  return {
    ...profile,
    trainingSessions: [
      ...profile.trainingSessions,
      {
        ...session,
        id: `session-${Date.now()}`,
        date: new Date().toISOString(),
      },
    ],
  }
}

export function updateKnowledgeGraph(
  profile: PersonalityProfile,
  topic: string,
  level: KnowledgeEntry['expertiseLevel'],
  details: string[]
): PersonalityProfile {
  const existing = profile.knowledgeGraph.findIndex(k => k.topic.toLowerCase() === topic.toLowerCase())
  const newGraph = [...profile.knowledgeGraph]
  
  if (existing >= 0) {
    newGraph[existing] = {
      ...newGraph[existing],
      expertiseLevel: level,
      details: [...new Set([...newGraph[existing].details, ...details])],
      lastUpdated: new Date().toISOString(),
    }
  } else {
    newGraph.push({ topic, expertiseLevel: level, details, lastUpdated: new Date().toISOString() })
  }
  
  return { ...profile, knowledgeGraph: newGraph }
}

// Training prompts
export const trainingPrompts = [
  "Hey! I'm your Elit — your AI clone in training. Let's start with the basics. Tell me about yourself. What do you do? What are you passionate about?",
  "What are your top skills and areas of expertise? What would people come to you for advice about?",
  "How would your closest friends describe your personality? What makes you, you?",
  "What are your core values? What principles guide your decisions?",
  "How do you communicate? Are you more formal or casual? Do you use humor? Are you straight to the point or do you elaborate?",
  "What topics get you most excited? What could you talk about for hours?",
  "How do you handle disagreements or difficult conversations?",
  "What's your approach to problem-solving? Walk me through how you think.",
  "Is there anything else you want me to know about you? Any quirks, catchphrases, or unique traits?",
]
