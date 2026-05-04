import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Lock } from 'lucide-react';
import { toast } from 'sonner';
import {
  type Mode,
  type Message,
  MODE_CONFIG,
  sendMessage,
  canSendMessage,
  incrementMessageCount,
  getRemainingFreeMessages,
} from '@/lib/claude';

export default function Chat() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<Mode>('developer');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!canSendMessage()) {
      toast.error('Free limit reached. Upgrade to Pro to continue.', {
        action: { label: 'Upgrade', onClick: () => navigate('/pricing') },
      });
      return;
    }
    const userMsg: Message = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    incrementMessageCount();
    try {
      const reply = await sendMessage(nextMessages, mode);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to get response';
      toast.error(msg);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const remaining = getRemainingFreeMessages();

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="border-b border-border/50 bg-card/30 px-4 py-2">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2 items-center">
          {(Object.keys(MODE_CONFIG) as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setMessages([]); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border ${
                mode === m
                  ? 'bg-primary/10 border-primary/40 text-primary'
                  : 'border-border/50 text-muted-foreground hover:border-primary/30'
              }`}
            >
              <span>{MODE_CONFIG[m].icon}</span>
              {MODE_CONFIG[m].label}
            </button>
          ))}
          <div className="ml-auto text-xs text-muted-foreground flex items-center gap-1">
            {remaining > 0 ? (
              <span>{remaining} free messages left</span>
            ) : (
              <span className="text-yellow-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Limit reached
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4">
        <div className="max-w-3xl mx-auto py-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground mt-20">
              <div className="text-5xl mb-4">{MODE_CONFIG[mode].icon}</div>
              <h2 className="text-xl font-semibold mb-2">{MODE_CONFIG[mode].label} Mode</h2>
              <p className="text-sm max-w-sm mx-auto">Ask me anything.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border/50'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border border-border/50 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>
      <div className="border-t border-border/50 bg-card/30 p-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Ask the ${MODE_CONFIG[mode].label} AI anything`}
            className="min-h-[60px] max-h-40 resize-none bg-background border-border/70"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-[60px] w-12 shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
