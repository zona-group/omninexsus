import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const FREE_FEATURES = [
  '5 free messages total',
  'Access to all 3 AI modes',
  'Developer, Researcher & Designer AI',
  'No credit card required',
];

const PRO_FEATURES = [
  'Unlimited messages',
  'Access to all 3 AI modes',
  'Faster response times',
  'Priority support',
  'Early access to new features',
];

export default function Pricing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleUpgrade = () => {
    if (!isAuthenticated) { navigate('/'); return; }
    localStorage.setItem('omni_subscription_active', 'true');
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Simple, honest pricing</h1>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you are ready.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-2xl border border-border/50 bg-card p-8">
            <div className="mb-6">
              <div className="text-3xl font-bold">Free</div>
              <div className="text-muted-foreground mt-1">Get started instantly</div>
            </div>
            <ul className="space-y-3 mb-8">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full" onClick={() => navigate('/chat')}>Start for free</Button>
          </div>
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-8 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm px-4 py-1 rounded-full font-semibold">Most Popular</div>
            <div className="mb-6">
              <div className="text-3xl font-bold gradient-text">$15 / month</div>
              <div className="text-muted-foreground mt-1">Everything unlimited</div>
            </div>
            <ul className="space-y-3 mb-8">
              {PRO_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" onClick={handleUpgrade}>Upgrade to Pro</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
