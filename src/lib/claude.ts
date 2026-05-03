export type Mode = 'developer' | 'researcher' | 'designer';

export const FREE_MESSAGE_LIMIT = 5;

export const MODE_CONFIG: Record<Mode, { label: string; icon: string; systemPrompt: string }> = {
  developer: {
    label: 'Developer',
    icon: '\u{1F468}\u200D\u{1F4BB}',
    systemPrompt: 'You are an expert software developer. Write clean, efficient code in any language, debug complex issues, explain technical concepts clearly, and provide architectural guidance. Always format code with proper markdown code blocks.',
  },
  researcher: {
    label: 'Researcher',
    icon: '\u{1F52C}',
    systemPrompt: 'You are an expert researcher and analyst. Find, synthesize, and explain information across domains. Provide well-structured, evidence-based responses with clear headings and organized bullet points.',
  },
  designer: {
    label: 'Designer',
    icon: '\u{1F3A8}',
    systemPrompt: 'You are an expert UX/UI designer and creative director. Generate design concepts, color palettes, typography suggestions, user experience flows, and compelling copy. Give concrete, actionable design recommendations.',
  },
};

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(messages: Message[], mode: Mode): Promise<string> {
  const { systemPrompt } = MODE_CONFIG[mode];
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(err.error || 'HTTP error');
  }
  const data = await response.json();
  return data.content;
}

export function canSendMessage(): boolean {
  if (isSubscriptionActive()) return true;
  return getRemainingFreeMessages() > 0;
}

export function incrementMessageCount(): void {
  const count = getMessageCount();
  localStorage.setItem('omni_msg_count', String(count + 1));
}

export function getRemainingFreeMessages(): number {
  return Math.max(0, FREE_MESSAGE_LIMIT - getMessageCount());
}

export function isSubscriptionActive(): boolean {
  return localStorage.getItem('omni_subscription_active') === 'true';
}

function getMessageCount(): number {
  return parseInt(localStorage.getItem('omni_msg_count') || '0', 10);
}
