export type Mode = 'developer' | 'researcher' | 'designer';
export const FREE_MESSAGE_LIMIT = 5;
export interface Message { role: 'user' | 'assistant'; content: string; }
export function canSendMessage() { return true; }
export function incrementMessageCount() {}
export function getRemainingFreeMessages() { return 5; }
export function isSubscriptionActive() { return false; }
export const MODE_CONFIG = {
  developer: { label: 'Developer', icon: 'D', systemPrompt: '' },
  researcher: { label: 'Researcher', icon: 'R', systemPrompt: '' },
  designer: { label: 'Designer', icon: 'D', systemPrompt: '' },
};
export async function sendMessage() { return ''; }
