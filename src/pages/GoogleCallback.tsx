import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function GoogleCallback() {
        const navigate = useNavigate();
        const { loginWithGoogle } = useAuth();

  useEffect(() => {
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');

                const done = () => navigate('/', { replace: true });

                if (!accessToken) {
                            done();
                            return;
                }

                const ctrl = new AbortController();
            const timeout = setTimeout(() => {
                        ctrl.abort();
                        done();
            }, 8000);

                fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                            headers: { Authorization: `Bearer ${accessToken}` },
                            signal: ctrl.signal,
                })
              .then((r) => r.json())
              .then(async (userInfo) => {
                            clearTimeout(timeout);
                            if (userInfo && userInfo.email) {
                                            await loginWithGoogle({
                                                              email: userInfo.email,
                                                              name: userInfo.name || userInfo.email,
                                                              avatar: userInfo.picture || '',
                                            });
                            }
                            done();
              })
              .catch(() => {
                            clearTimeout(timeout);
                            done();
              });
  }, []);

  return (
            <div className="flex items-center justify-center h-screen bg-background">
                  <div className="text-center">
                          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-muted-foreground">Google ile giriÅ yapÄ±lÄ±yor...</p>
                  </div>
            </div>
          );
}</div>
