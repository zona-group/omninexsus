import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg gradient-text">
          OmniNexus
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/chat" className="text-muted-foreground hover:text-foreground transition-colors">Chat</Link>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="gap-1">
                  <User className="w-4 h-4" />
                  {user?.name || 'Profile'}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/')}>Login</Button>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600" onClick={() => navigate('/')}>Sign Up</Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
