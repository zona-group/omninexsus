import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Navbar({ onLoginClick, onRegisterClick }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogin = () => { if (onLoginClick) { onLoginClick(); } else { navigate('/'); } };
  const handleRegister = () => { if (onRegisterClick) { onRegisterClick(); } else { navigate('/'); } };
  const handleLogout = () => { logout(); navigate('/'); };
  return (
    <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg gradient-text">OmniNexus</Link>
        <div className="flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          {isAuthenticated && <Link to="/chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Chat</Link>}
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">{user?.name || user?.email}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={handleLogin}>Login</Button>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white" onClick={handleRegister}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
