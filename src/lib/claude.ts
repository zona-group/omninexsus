export type Mode = 'developer' | 'researcher' | 'designer';

export const MODE_CONFIG: Record<Mode, { label: string; icon: string; description: string; systemPrompt: string; placeholder: string }> = {
  developer: {
    label: 'Developer',
    icon: '👨‍💻',
    description: 'Code, debug, architecture & docs',
    systemPrompt:
      'You are an expert software developer assistant. Help with coding, debugging, architecture, and technical documentation. Be precise and practical. When showing code, always use proper markdown code blocks with the language specified.',
    placeholder: 'Ask me to write code, debug an issue, explain a concept...',
  },
  researcher: {
    label: 'Researcher',
    icon: '🔬',
    description: 'Search, summarize, analyze & compare',
    systemPrompt:
      'You are an expert research assistant. Help find information, analyze sources, summarize papers, compare perspectives, and create structured reports. Be thorough, cite reasoning clearly, and present information in an organized way.',
    placeholder: 'Ask me to research a topic, compare options, summarize...',
  },
  designer: {
    label: 'Designer',
    icon: '🎨',
    description: 'UI/UX concepts, palettes & copy',
    systemPrompt:
      'You are an expert design assistant. Help with UI/UX concepts, color theory, typography, copywriting, design briefs, and creative direction. Be creative, specific, and visually descriptive in your suggestions.',
    placeholder: 'Ask me for design concepts, color palettes, copy ideas...',
  },
};

export const FREE_MESSAGE_LIMIT = 5;
export const MSG_COUNT_KEY = 'omni_msg_count';
export const SUBSCRIPTION_KEY = 'omni_subscription_active';

export function getMessageCount(): number {
  return parseInt(localStorage.getItem(MSG_COUNT_KEY) || '0', 10);
}

export function incrementMessageCount(): number {
  const next = getMessageCount() + 1;
  localStorage.setItem(MSG_COUNT_KEY, String(next));
  return next;
}

export function isSubscriptionActive(): boolean {
  return localStorage.getItem(SUBSCRIPTION_KEY) === 'true';
}

export function canSendMessage(): boolean {
  return isSubscriptionActive() || getMessageCount() < FREE_MESSAGE_LIMIT;
}

export function remainingFreeMessages(): number {
  return Math.max(0, FREE_MESSAGE_LIMIT - getMessageCount());
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendMessage(
  messages: ChatMessage[],
  mode: Mode,
  signal?: AbortSignal
): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      messages,
      systemPrompt: MODE_CONFIG[mode].systemPrompt,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content;
}
