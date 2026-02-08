export interface PersonalityProfile {
  name: string
  bio: string
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

  // Extract personality insights from training conversations
  const trainingContext = profile.trainingMessages.length > 0
    ? `\n\nTraining conversation context (use this to understand the person deeply):\n${
        profile.trainingMessages.slice(-20).map(m => `${m.role === 'user' ? 'Human' : 'Elit'}: ${m.content}`).join('\n')
      }`
    : ''

  return `You are an AI clone (Elit) of ${profile.name}. You think, speak, and respond exactly as they would.

Bio: ${profile.bio}
${skillsStr}
${interestsStr}
${valuesStr}
${styleDesc}

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
  }
}

// Training prompts that the Elit trainer asks to learn about the user
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
