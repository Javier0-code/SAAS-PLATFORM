import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, Apple, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import { authService } from '@services/authService';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const FormInput = ({ icon: Icon, type = 'text', placeholder, value, onChange, error, rightEl }) => (
  <div>
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none">
        <Icon size={15} />
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
        className={clsx(
          'input pl-10 h-11',
          rightEl && 'pr-10',
          error && 'border-danger-500/50 focus:ring-danger-500/30 focus:border-danger-500'
        )}
      />
      {rightEl && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</div>
      )}
    </div>
    {error && <p className="text-danger-400 text-xs mt-1">{error}</p>}
  </div>
);

const LoginForm = ({ onSuccess }) => {
  const { loginWithEmail } = useAuth();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = {};
    if (!form.email)    errs.email    = 'El email es requerido';
    if (!form.password) errs.password = 'La contraseña es requerida';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await loginWithEmail(form.email, form.password);
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormInput icon={Mail} type="email" placeholder="tu@email.com"
        value={form.email} onChange={set('email')} error={errors.email} />
      <FormInput icon={Lock} type={showPwd ? 'text' : 'password'} placeholder="Contraseña"
        value={form.password} onChange={set('password')} error={errors.password}
        rightEl={
          <button type="button" onClick={() => setShowPwd(p => !p)}
            className="text-surface-500 hover:text-surface-300 transition-colors">
            {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
          </button>
        }
      />
      <button type="submit" disabled={loading} className="btn-primary w-full h-11 mt-1">
        {loading
          ? <Loader2 size={15} className="animate-spin"/>
          : <><span>Iniciar sesión</span><ArrowRight size={14}/></>}
      </button>
    </form>
  );
};

const RegisterForm = ({ onSuccess }) => {
  const { registerWithEmail } = useAuth();
  const [form, setForm]       = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const errs = {};
    if (!form.name)    errs.name    = 'El nombre es requerido';
    if (!form.email)   errs.email   = 'El email es requerido';
    if (form.password.length < 8) errs.password = 'Mínimo 8 caracteres';
    if (form.password !== form.confirm) errs.confirm = 'Las contraseñas no coinciden';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await registerWithEmail(form.name, form.email, form.password);
      onSuccess();
    } catch (err) {
      toast.error(err.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const eyeEl = (
    <button type="button" onClick={() => setShowPwd(p => !p)}
      className="text-surface-500 hover:text-surface-300 transition-colors">
      {showPwd ? <EyeOff size={14}/> : <Eye size={14}/>}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <FormInput icon={User} placeholder="Tu nombre completo"
        value={form.name} onChange={set('name')} error={errors.name} />
      <FormInput icon={Mail} type="email" placeholder="tu@email.com"
        value={form.email} onChange={set('email')} error={errors.email} />
      <FormInput icon={Lock} type={showPwd ? 'text' : 'password'} placeholder="Contraseña (mín. 8 caracteres)"
        value={form.password} onChange={set('password')} error={errors.password} rightEl={eyeEl} />
      <FormInput icon={Lock} type={showPwd ? 'text' : 'password'} placeholder="Confirmar contraseña"
        value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
      <button type="submit" disabled={loading} className="btn-primary w-full h-11 mt-1">
        {loading
          ? <Loader2 size={15} className="animate-spin"/>
          : <><span>Crear cuenta</span><ArrowRight size={14}/></>}
      </button>
    </form>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');

  const onSuccess = () => {
    toast.success(tab === 'login' ? '¡Bienvenido de nuevo! 👋' : '¡Cuenta creada! 🎉');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[500px]
          bg-brand-500/8 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-sm"
      >
        <div className="card p-8 border-surface-700/60">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow-brand mb-3">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <h1 className="font-display text-xl font-bold text-surface-100">
              {tab === 'login' ? 'Bienvenido de nuevo' : 'Crear tu cuenta'}
            </h1>
            <p className="text-surface-500 text-xs mt-0.5">
              {tab === 'login' ? 'Inicia sesión en tu workspace' : 'Únete a SaaS Platform'}
            </p>
          </div>

          {/* OAuth */}
          <div className="space-y-2.5 mb-5">
            <button onClick={() => authService.loginWithGoogle()}
              className="btn-secondary w-full h-10 gap-3 hover:border-blue-500/40 text-sm">
              <GoogleIcon />Continuar con Google
            </button>
            <button onClick={() => authService.loginWithApple()}
              className="btn-secondary w-full h-10 gap-3 text-sm">
              <Apple size={16}/>Continuar con Apple
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="divider" />
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
              bg-surface-900 px-3 text-2xs text-surface-500 uppercase tracking-wider">
              o con email
            </span>
          </div>

          {/* Tabs */}
          <div className="flex bg-surface-800/50 rounded-lg p-0.5 mb-4">
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={clsx(
                  'flex-1 py-1.5 text-xs font-medium rounded-md transition-all duration-150',
                  tab === t ? 'bg-surface-700 text-surface-100 shadow-sm' : 'text-surface-500 hover:text-surface-300'
                )}>
                {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
              </button>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            <motion.div key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {tab === 'login'
                ? <LoginForm onSuccess={onSuccess} />
                : <RegisterForm onSuccess={onSuccess} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="text-center text-surface-600 text-xs mt-4">
          <Link to="/" className="hover:text-surface-400 transition-colors">← Volver al inicio</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
