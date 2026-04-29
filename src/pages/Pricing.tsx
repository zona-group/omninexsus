import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Check, Zap } from 'lucide-react';

const FREE_FEATURES = [
  '5 free messages to start',
  'Access to all 3 AI modes',
  'Developer, Researcher & Designer',
  'No credit card required',
];

const PRO_FEATURES = [
  'Unlimited messages',
  'All 3 AI modes',
  'Priority response speed',
  'Early access to new features',
  'Cancel anytime',
];

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleUpgrade = () => {
    // Stripe placeholder — in production, redirect to Stripe Checkout
    alert('Stripe integration coming soon! For now, this is a placeholder.');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary mb-6">
              <Zap className="w-3.5 h-3.5" />
              Simple, transparent pricing
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">One plan.</span> Everything included.
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees.
            </p>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free */}
            <div className="rounded-2xl border border-border/50 bg-card p-8 flex flex-col">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-muted-foreground mb-1">Free</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Perfect to try it out</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-muted-foreground" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => isAuthenticated ? navigate('/chat') : navigate('/')}
              >
                {isAuthenticated ? 'Go to Chat' : 'Get Started Free'}
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border-2 border-primary/50 bg-card relative p-8 flex flex-col shadow-lg shadow-primary/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                  MOST POPULAR
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold gradient-text mb-1">Pro</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold gradient-text">$15</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">For power users & professionals</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold"
                onClick={handleUpgrade}
              >
                Upgrade to Pro — $15/mo
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Secure payment via Stripe · Cancel anytime
              </p>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10">Frequently asked questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'What happens when I run out of free messages?',
                  a: 'After your 5 free messages you\'ll see an upgrade prompt. Your chat history is preserved — just upgrade to continue.',
                },
                {
                  q: 'Can I cancel my subscription?',
                  a: 'Yes, cancel anytime from your profile. Your Pro access continues until the end of the billing period.',
                },
                {
                  q: 'Which AI model is used?',
                  a: 'OmniNexus is powered by Claude — Anthropic\'s fast, accurate AI model.',
                },
                {
                  q: 'Is my data private?',
                  a: 'Your conversations are not used to train AI models. We take privacy seriously.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-border/50 pb-6">
                  <h3 className="font-semibold mb-2">{q}</h3>
                  <p className="text-muted-foreground text-sm">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
