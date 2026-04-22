import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, User, Bookmark, Settings, LogOut, Menu, X, Shield, Twitter, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface NavbarProps {
  onSearch?: (query: string) => void;
}

const googleIconSvg = (
  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Separate component - useGoogleLogin is only called when Google OAuth is configured
function GoogleOAuthButton({
  label,
  onGoogleSuccess,
  onGoogleFallback,
}: {
  label: string;
  onGoogleSuccess: (userData: { email: string; name: string; avatar: string }) => void;
  onGoogleFallback: () => void;
}) {
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((r) => r.json());
        onGoogleSuccess({ email: userInfo.email, name: userInfo.name, avatar: userInfo.picture });
      } catch {
        onGoogleFallback();
      }
    },
    onError: () => onGoogleFallback(),
  });

  return (
    <Button type="button" variant="outline" className="w-full" onClick={() => googleLogin()}>
      {googleIconSvg}
      {label}
    </Button>
  );
}

export default function Navbar({ onSearch }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <div className="font-bold text-lg gradient-text">OmniNexus</div>
              <div className="text-xs text-muted-foreground">Live · Global</div>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search global news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 bg-secondary/50 border-border/50 focus:border-primary"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-primary transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>


          <div className="flex items-center gap-2">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hidden sm:flex"><Twitter className="w-4 h-4" /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hidden sm:flex"><Facebook className="w-4 h-4" /></a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hidden sm:flex"><Instagram className="w-4 h-4" /></a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hidden sm:flex"><Linkedin className="w-4 h-4" /></a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors hidden sm:flex"><Youtube className="w-4 h-4" /></a>
            <Link
              to="/#contact"
              className="hidden md:block text-sm text-muted-foreground hover:text-primary transition-colors px-3 py-1.5 border border-border/50 rounded-lg"
            >
              İletişim
            </Link>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <img
                      src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`}
                      alt={user?.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/saved')}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Saved Articles
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className={user?.email !== 'info@omninexsus.com' ? 'hidden' : ''} onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowLoginModal(true)}>
                  Login
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-indigo-500 to-purple-600"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Sign Up
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fadeIn">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search global news..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="px-3 py-2 text-sm hover:bg-secondary rounded-lg">About</Link>
              <Link to="/saved" className="px-3 py-2 text-sm hover:bg-secondary rounded-lg">Saved Articles</Link>
              {!isAuthenticated && (
                <>
                  <Button variant="ghost" onClick={() => setShowLoginModal(true)}>Login</Button>
                  <Button
                    className="bg-gradient-to-r from-indigo-500 to-purple-600"
                    onClick={() => setShowRegisterModal(true)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text">Welcome Back</DialogTitle>
          </DialogHeader>
          <LoginForm
            onClose={() => setShowLoginModal(false)}
            onRegisterClick={() => {
              setShowLoginModal(false);
              setShowRegisterModal(true);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center gradient-text">Create Account</DialogTitle>
          </DialogHeader>
          <RegisterForm
            onClose={() => setShowRegisterModal(false)}
            onLoginClick={() => {
              setShowRegisterModal(false);
              setShowLoginModal(true);
            }}
          />
        </DialogContent>
      </Dialog>
    </nav>
  );
}

function LoginForm({ onClose, onRegisterClick }: { onClose: () => void; onRegisterClick: () => void }) {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await login(email, password);
    if (success) {
      onClose();
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (userData: { email: string; name: string; avatar: string }) => {
    await loginWithGoogle(userData);
    onClose();
  };

  const handleGoogleFallback = async () => {
    await loginWithGoogle();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthButton
          label="Continue with Google"
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleFallback={handleGoogleFallback}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleFallback}
        >
          {googleIconSvg}
          Continue with Google
        </Button>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {error && <div className="text-sm text-red-500 text-center">{error}</div>}

      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="rounded border-border" />
          <span className="text-muted-foreground">Remember me</span>
        </label>
        <button type="button" onClick={() => navigate('/forgot-password')} className="text-primary hover:underline">
          Forgot password?
        </button>
      </div>

      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        No account?{' '}
        <button type="button" onClick={onRegisterClick} className="text-primary hover:underline">
          Sign up free
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onClose, onLoginClick }: { onClose: () => void; onLoginClick: () => void }) {
  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const success = await register(email, password, name);
    if (success) {
      onClose();
    } else {
      setError('Email already exists');
    }
    setLoading(false);
  };

  const handleGoogleSuccess = async (userData: { email: string; name: string; avatar: string }) => {
    await loginWithGoogle(userData);
    onClose();
  };

  const handleGoogleFallback = async () => {
    await loginWithGoogle();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {GOOGLE_CLIENT_ID ? (
        <GoogleOAuthButton
          label="Sign up with Google"
          onGoogleSuccess={handleGoogleSuccess}
          onGoogleFallback={handleGoogleFallback}
        />
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleFallback}
        >
          {googleIconSvg}
          Sign up with Google
        </Button>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {error && <div className="text-sm text-red-500 text-center">{error}</div>}

      <Input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />

      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Have an account?{' '}
        <button type="button" onClick={onLoginClick} className="text-primary hover:underline">
          Login
        </button>
      </p>
    </form>
  );
}
