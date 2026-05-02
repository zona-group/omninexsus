import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';

const FREE_FEATURES = ['5 free messages to start', 'Access to all 3 AI modes', 'Developer, Researcher & Designer', 'No credit card required'];
const PRO_FEATURES = ['Unlimited messages', 'All 3 AI modes', 'Priority response speed', 'Early access to new features', 'Cancel anytime'];

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6"><Zap className="w-3.5 h-3.5" />Simple, transparent pricing</div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4"><span className="gradient-text">One plan.</span> Everything included.</h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">Start free, upgrade when you're ready. No hidden fees.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border/50 bg-card p-8 flex flex-col">
              <h2 className="text-lg font-semibold text-muted-foreground mb-1">Free</h2>
              <div className="text-5xl font-bold mb-4">$0<span className="text-base text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 flex-1 mb-8">{FREE_FEATURES.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="w4 h-4 text-muted-foreground" />{f}</li>)}</ul>
              <Button variant="outline" className="w-full" onClick={() => isAuthenticated ? navigate('/chat') : navigate('/')}>{isAuthenticated ? 'Go to Chat' : 'Get Started Free'}</Button>
            </div>
            <div className="rounded-2xl border-2 border-primary/50 bg-card relative p-8 flex flex-col shadow-lg shadow-primary/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">MOST POPULAR</div>
              <h2 className="text-lg font-semibold gradient-text mb-1">Pro</h2>
              <div className="text-5xl font-bold gradient-text mb-4">$15<span className="text-base text-muted-foreground">/mo</span></div>
              <ul className="space-y-2 flex-1 mb-8">{PRO_FEATURES.map(f => <li key={f} className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-primary" />{f}</li>)}</ul>
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={() => alert('Stripe coming soon!')}>Upgrade to Pro — $15/mo</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
