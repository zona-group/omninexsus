import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * AuthCallback -- handles redirect from /api/auth/google/callback.
 * Server appends ?user=<URL-encoded JSON> with { email, name, avatar }.
 */
export default function AuthCallback() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userParam = params.get('user');
    if (userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        loginWithGoogle(userData).then(() => navigate('/chat', { replace: true }));
      } catch {
        navigate('/', { replace: true });
      }
    } else {
      navigate('/', { replace: true });
    }
  }, [loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground text-sm">Google ile giriÅ yapÄ±lÄ±yor...</p>
      </div>
    </div>
  );
}
