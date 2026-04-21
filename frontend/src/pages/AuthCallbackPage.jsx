import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';
import toast from 'react-hot-toast';

const AuthCallbackPage = () => {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const { login }  = useAuth();
  const processed  = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const handleCallback = async () => {
      const error        = params.get('error');
      const accessToken  = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (error) {
        const messages = {
          google_failed:           'Google login failed. Please try again.',
          apple_failed:            'Apple login failed. Please try again.',
          apple_not_configured:    'Apple Sign In is not configured yet.',
          oauth_failed:            'Authentication failed. Please try again.',
          server_error:            'Server error during authentication.',
        };
        toast.error(messages[error] || 'Authentication failed');
        navigate('/login', { replace: true });
        return;
      }

      if (!accessToken) {
        toast.error('No authentication token received');
        navigate('/login', { replace: true });
        return;
      }

      try {
        // Guardar tokens
        localStorage.setItem('access_token',  accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

        // Obtener perfil del usuario
        const res = await authService.getMe();
        login(res.data.user, { accessToken, refreshToken });

        toast.success(`¡Bienvenido, ${res.data.user.name}! 👋`);
        navigate('/dashboard', { replace: true });
      } catch {
        toast.error('Failed to load user profile');
        navigate('/login', { replace: true });
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-surface-400 text-sm">Completando inicio de sesión...</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
