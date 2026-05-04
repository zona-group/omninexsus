import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MODE_CONFIG,
  type Mode,
  type ChatMessage,
  sendMessage,
  canSendMessage,
  incrementMessageCount,
  remainingFreeMessages,
  isSubscriptionActive,
  FREE_MESSAGE_LIMIT,
} from '@/lib/claude';
import { Send, AlertCircle, Zap, Loader2 } from 'lucide-react';

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].startsWith('```')) {
      const lang = lines[i].slice(3).trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      elements.push(
        <div key={i} className="my-3 rounded-lg overflow-hidden border border-border/50">
          {lang && (
            <div className="px-3 py-1 bg-secondary/80 text-xs text-muted-foreground font-mono border-b border-border/50">
              {lang}
            </div>
          )}
          <pre className="p-4 bg-secondary/40 overflow-x-auto text-sm font-mono text-foreground/90 whitespace-pre">
            {codeLines.join('\n')}
          </pre>
        </div>
      );
    } else {
      const line = lines[i];
      if (line === '') {
        elements.push(<br key={i} />);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(4)}</h3>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(3)}</h2>);
      } else if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="font-bold text-xl mt-4 mb-2">{line.slice(2)}</h1>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <div key={i} className="flex gap-2 my-0.5">
            <span className="text-primary mt-1">•</span>
            <span>{renderInline(line.slice(2))}</span>
          </div>
        );
      } else {
        elements.push(<p key={i} className="my-1">{renderInline(line)}</p>);
      }
      i++;
    }
  }
  return <div className="text-sm leading-relaxed">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={idx} className="bg-secondary/60 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function Chat() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('developer');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [remaining, setRemaining] = useState(remainingFreeMessages());
  const [subscribed, setSubscribed] = useState(isSubscriptionActive());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!canSendMessage()) {
      setShowUpgrade(true);
      return;
    }
    setInput('');
    setError('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setLoading(true);
    const newCount = incrementMessageCount();
    setRemaining(Math.max(0, FREE_MESSAGE_LIMIT - newCount));
    abortRef.current = new AbortController();
    try {
      const reply = await sendMessage(nextMessages, mode, abortRef.current.signal);
      setMessages([...nextMessages, { role: 'assistant', content: reply }]);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      const msg = err.message || 'Something went wrong';
      setError(msg);
      setMessages([...nextMessages, { role: 'assistant', content: `⚠️ ${msg}` }]);
    } finally {
      setLoading(false);
      abortRef.current = null;
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setMessages([]);
    setError('');
  };

  const currentMode = MODE_CONFIG[mode];
  if (!isAuthenticated) return null;

  return (
    <div className="flex flex-col h-screen bg-background">
      <Navbar />
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 flex-wrap">
          {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => handleModeChange(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
                mode === key
                  ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                  : 'border-border/50 text-muted-foreground hover:text-foreground hover:border-border hover:bg-secondary/50'
              }`}
            >
              <span>{cfg.icon}</span>
              <span>{cfg.label}</span>
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            {!subscribed && (
              <div className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border ${
                remaining === 0 ? 'text-red-400 border-red-400/30 bg-red-400/10'
                  : remaining <= 2 ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
                  : 'text-muted-foreground border-border/50'
              }`}>
                <Zap className="w-3 h-3" />
                {remaining === 0 ? 'Free limit reached' : `${remaining}/${FREE_MESSAGE_LIMIT} free messages`}
              </div>
            )}
            {subscribed && (
              <div className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-indigo-400/30 bg-indigo-400/10 text-indigo-400">
                <Zap className="w-3 h-3" />Pro
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="text-6xl mb-4">{currentMode.icon}</div>
              <h2 className="text-2xl font-bold gradient-text mb-2">{currentMode.label} Mode</h2>
              <p className="text-muted-foreground max-w-md">{currentMode.description}</p>
              <p className="text-muted-foreground/60 text-sm mt-2">{currentMode.placeholder}</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-secondary border border-border/50 text-lg'
              }`}>
                {msg.role === 'user' ? (user?.name?.[0]?.toUpperCase() || 'U') : currentMode.icon}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm' : 'bg-card border border-border/50 rounded-tl-sm'
              }`}>
                {msg.role === 'assistant' ? <MarkdownText text={msg.content} /> : <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-lg">{currentMode.icon}</div>
              <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {!subscribed && remaining === 0 ? (
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/30 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-indigo-400" />
                <span className="text-foreground">Free messages used up. Upgrade to keep chatting.</span>
              </div>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 ml-4" onClick={() => navigate('/pricing')}>
                Upgrade — $15/mo
              </Button>
            </div>
          ) : (
            <div className="flex gap-3 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentMode.placeholder}
                rows={1}
                className="flex-1 resize-none min-h-[44px] max-h-40 bg-secondary/50 border-border/50 focus:border-primary rounded-xl py-3"
              />
              <Button onClick={handleSend} disabled={loading || !input.trim()} className="h-11 w-11 p-0 bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0 rounded-xl">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          )}
          <p className="text-xs text-muted-foreground/50 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text text-2xl">Upgrade to Pro</DialogTitle>
            <DialogDescription className="text-center pt-2">You have used all {FREE_MESSAGE_LIMIT} free messages.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold gradient-text">$15</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              {['Unlimited messages', 'All 3 AI modes', 'Priority response speed', 'Early access to new features'].map(f => (
                <li key={f} className="flex items-center gap-2"><span className="text-primary">✓</span>{f}</li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" onClick={() => { setShowUpgrade(false); navigate('/pricing'); }}>
              Get Started — $15/month
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setShowUpgrade(false)}>Maybe later</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
