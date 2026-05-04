import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowRight, Zap, Shield, Sparkles } from 'lucide-react';

const MODES = [
  { icon: '👨‍💻', label: 'Developer', color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400', description: 'Write, debug, and explain code. Get architecture advice and technical documentation in seconds.', examples: ['Fix this React hook bug', 'Write a REST API in Go', 'Explain async/await'] },
  { icon: '🔬', label: 'Researcher', color: 'from-green-500/20 to-teal-500/20', border: 'border-green-500/30', badge: 'bg-green-500/20 text-green-400', description: 'Search and analyze information. Summarize papers, compare perspectives, and build structured reports.', examples: ['Summarize this paper', 'Compare X vs Y', 'Research trends in AI'] },
  { icon: '🎨', label: 'Designer', color: 'from-pink-500/20 to-purple-500/20', border: 'border-pink-500/30', badge: 'bg-pink-500/20 text-pink-400', description: 'Generate UI/UX concepts, color palettes, typography choices, copy, and full design briefs.', examples: ['Color palette for fintech app', 'Landing page copy', 'Font pairing for a startup'] },
];

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const handleCTA = () => { if (isAuthenticated) { navigate('/chat'); } else { setShowRegisterModal(true); } };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar onLoginClick={() => setShowLoginModal(true)} onRegisterClick={() => setShowRegisterModal(true)} />
      <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-24 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Claude · Built for professionals
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            One AI platform.{' '}<br />
            <span className="gradient-text">Three expert modes.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Whether you're coding, researching, or designing — OmniNexus puts the right AI expert at your fingertips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-base px-8 h-12" onClick={handleCTA}>
              Start for free <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12 border-border/70" onClick={() => navigate('/pricing')}>
              View pricing
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">5 free messages · No credit card required</p>
        </div>
      </section>
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose your mode</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Each mode has a specialized AI persona tuned for that discipline.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {MODES.map((m) => (
              <div key={m.label} className={`rounded-2xl border ${m.border} bg-gradient-to-br ${m.color} p-6 flex flex-col gap-4 hover:scale-[1.02] transition-transform cursor-pointer`} onClick={handleCTA}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{m.icon}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${m.badge}`}>{m.label}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.description}</p>
                <div className="mt-auto space-y-1.5">
                  {m.examples.map((ex) => (
                    <div key={ex} className="flex items-center gap-2 text-xs text-muted-foreground/70 bg-background/40 rounded-lg px-3 py-1.5">
                      <span className="text-primary">→</span>{ex}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          {[{ icon: <Zap className="w-6 h-6" />, title: 'Fast responses', desc: 'Claude-powered answers in seconds, not minutes.' }, { icon: <Shield className="w-6 h-6" />, title: 'Private by default', desc: 'Your conversations are never used for training.' }, { icon: <Sparkles className="w-6 h-6" />, title: '3 specialized modes', desc: 'Developer, Researcher, Designer — each finely tuned.' }].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">{icon}</div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="py-20 px-4 bg-card/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, honest pricing</h2>
          <p className="text-muted-foreground mb-8">Start free. Upgrade when you need more.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="rounded-2xl border border-border/50 bg-card px-8 py-6 min-w-48">
              <div className="text-3xl font-bold">$0</div>
              <div className="text-muted-foreground text-sm mt-1">5 free messages</div>
            </div>
            <div className="text-muted-foreground">→</div>
            <div className="rounded-2xl border-2 border-primary/40 bg-card px-8 py-6 min-w-48 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs px-3 py-0.5 rounded-full font-semibold">PRO</div>
              <div className="text-3xl font-bold gradient-text">$15</div>
              <div className="text-muted-foreground text-sm mt-1">per month · unlimited</div>
            </div>
          </div>
          <Button className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600" onClick={() => navigate('/pricing')}>See full pricing details</Button>
        </div>
      </section>
      <footer className="py-8 px-4 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>© 2025 OmniNexus · Built with Claude by Anthropic</p>
      </footer>
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-center gradient-text">Welcome Back</DialogTitle></DialogHeader>
          <LoginForm onClose={() => setShowLoginModal(false)} onRegisterClick={() => { setShowLoginModal(false); setShowRegisterModal(true); }} />
        </DialogContent>
      </Dialog>
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-center gradient-text">Create Account</DialogTitle></DialogHeader>
          <RegisterForm onClose={() => setShowRegisterModal(false)} onLoginClick={() => { setShowRegisterModal(false); setShowLoginModal(true); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoginForm({ onClose, onRegisterClick }: { onClose: () => void; onRegisterClick: () => void }) {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const ok = await login(email, password);
    if (ok) { onClose(); navigate('/chat'); } else setError('Invalid email or password');
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Button type="button" variant="outline" className="w-full" onClick={async () => { await loginWithGoogle(); onClose(); navigate('/chat'); }}>
        <GoogleIcon /> Continue with Google
      </Button>
      <Divider />
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <div className="flex justify-end text-sm">
        <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary hover:underline">Forgot password?</button>
      </div>
      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</Button>
      <p className="text-center text-sm text-muted-foreground">No account?{' '}<button type="button" onClick={onRegisterClick} className="text-primary hover:underline">Sign up free</button></p>
    </form>
  );
}
function RegisterForm({ onClose, onLoginClick }: { onClose: () => void; onLoginClick: () => void }) {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    const ok = await register(email, password, name);
    if (ok) { onClose(); navigate('/chat'); } else setError('Email already exists');
    setLoading(false);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      <Input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
      <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
      <p className="text-center text-sm text-muted-foreground">Have an account?{' '}<button type="button" onClick={onLoginClick} className="text-primary hover:underline">Login</button></p>
    </form>
  );
}
function GoogleIcon() { return (<svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>); }
function Divider() { return (<div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">or</span></div></div>); }
