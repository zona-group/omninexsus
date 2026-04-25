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

                if (accessToken) {
                          fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                                      headers: { Authorization: `Bearer ${accessToken}` },
                          })
                            .then((r) => r.json())
                            .then(async (userInfo) => {
                                          await loginWithGoogle({
                                                          email: userInfo.email,
                                                          name: userInfo.name,
                                                          avatar: userInfo.picture,
                                          });
                                          navigate('/');
                            })
                            .catch(() => navigate('/'));
                } else {
                          navigate('/');
                }
  }, []);

  return (
          <div className="flex items-center justify-center h-screen">
                <p className="text-muted-foreground">Google ile giris yapiliyor...</p>
          </div>
        );
}
