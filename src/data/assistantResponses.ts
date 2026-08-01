export const DISCLAIMER = "This isn't medical advice — always check with your care team."

export const EMERGENCY_MESSAGE =
  "If this is a medical emergency or you're in crisis, please contact emergency services right now — call 911 (US), 999 (UK), 112 (EU), or your local emergency number. If you're thinking about suicide, you can call or text 988 (US) any time. I'm not able to continue this conversation here — please reach out to a real person now."

const RED_FLAG_KEYWORDS = [
  'chest pain',
  'difficulty breathing',
  "can't breathe",
  'cannot breathe',
  'trouble breathing',
  'severe headache',
  'worst headache',
  'suicidal',
  'suicide',
  'kill myself',
  'want to die',
  'end my life',
  'ending my life',
]

const DIAGNOSIS_KEYWORDS = [
  'diagnose',
  'diagnosis',
  'what do i have',
  "whats wrong with me",
  "what's wrong with me",
  'do i have lupus',
  'is this lupus',
  'what condition',
  'name my condition',
  'what disease',
  'what illness',
]

const LAB_KEYWORDS = [
  'ana result',
  'ana panel',
  'interpret my',
  'blood test mean',
  'lab result',
  'is my result normal',
  'what does this test mean',
  'what does my result mean',
  'test results mean',
]

const DOSE_KEYWORDS = [
  'how much should i take',
  'what dose',
  'increase my dose',
  'decrease my dose',
  'how many mg',
  'dosage',
  'how much medication',
]

const DATA_SUMMARY_KEYWORDS = ['how am i doing', 'my streak', 'my flare', 'summary', 'summarise', 'summarize']
const APPOINTMENT_KEYWORDS = ['appointment', 'ask my doctor', 'questions for', 'what should i ask']
const TERMINOLOGY_KEYWORDS = ['what is', 'what does', 'mean', 'define', 'explain']

function includesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase()
  return keywords.some((k) => lower.includes(k))
}

export type AssistantContext = {
  streak: number
  activeFlareDays: number | null
  cyclePercent: number | null
}

export type AssistantReply = { text: string; isEmergency: boolean }

export function getAssistantResponse(userText: string, ctx: AssistantContext): AssistantReply {
  if (includesAny(userText, RED_FLAG_KEYWORDS)) {
    return { text: EMERGENCY_MESSAGE, isEmergency: true }
  }

  if (includesAny(userText, DIAGNOSIS_KEYWORDS)) {
    return {
      text: `I can't diagnose or name a likely condition — that needs a clinician who can examine you and see your full history. What I can do is help you describe what you're feeling clearly, or pull together your logged patterns so a doctor has more to go on.\n\n${DISCLAIMER}`,
      isEmergency: false,
    }
  }

  if (includesAny(userText, LAB_KEYWORDS)) {
    return {
      text: `I'm not able to interpret lab or test results — what a value means depends on your history and other results, and that's a conversation for whoever ordered the test. I can help you write down questions to ask them about it.\n\n${DISCLAIMER}`,
      isEmergency: false,
    }
  }

  if (includesAny(userText, DOSE_KEYWORDS)) {
    return {
      text: `I can't advise on medication doses — that has to come from your prescriber. If a dose isn't working for you, that's worth flagging to them directly.\n\n${DISCLAIMER}`,
      isEmergency: false,
    }
  }

  if (includesAny(userText, DATA_SUMMARY_KEYWORDS)) {
    const parts = [`You're on a ${ctx.streak}-day logging streak.`]
    if (ctx.activeFlareDays) {
      parts.push(`You're currently in a flare, day ${ctx.activeFlareDays}.`)
    }
    if (ctx.cyclePercent != null) {
      parts.push(
        `Your joint pain has been running about ${ctx.cyclePercent}% higher in the days before your period.`,
      )
    }
    return { text: `${parts.join(' ')}\n\n${DISCLAIMER}`, isEmergency: false }
  }

  if (includesAny(userText, APPOINTMENT_KEYWORDS)) {
    return {
      text: `A few questions that tend to help:\n• What pattern are you seeing in my symptoms?\n• Which tests would help rule things in or out at this stage?\n• What would you expect to see if it were the condition you suspect?\n• What should I keep tracking before the next visit?\n\n${DISCLAIMER}`,
      isEmergency: false,
    }
  }

  if (includesAny(userText, TERMINOLOGY_KEYWORDS)) {
    return {
      text: `Happy to explain a term — tell me which one, like "flare," "luteal phase," or "ANA panel," and I'll walk through it.\n\n${DISCLAIMER}`,
      isEmergency: false,
    }
  }

  return {
    text: `I can help you describe your symptoms, summarise what you've logged, or prep questions for an appointment. What would help most right now?\n\n${DISCLAIMER}`,
    isEmergency: false,
  }
}
