import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Zap, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { workspaceService } from '@services/workspaceService';
import { useAuth } from '@context/AuthContext';
import { useWorkspace } from '@context/WorkspaceContext';
import toast from 'react-hot-toast';

const JoinWorkspacePage = () => {
  const { token }     = useParams();
  const navigate      = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { fetchWorkspaces } = useWorkspace();

  const [preview, setPreview]   = useState(null);
  const [status, setStatus]     = useState('loading'); // loading | ready | joining | success | error
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      localStorage.setItem('join_token_pending', token);
      navigate(`/login?redirect=/join/${token}`);
      return;
    }
    loadPreview();
  }, [authLoading, isAuthenticated, token]);

  const loadPreview = async () => {
    try {
      const res = await workspaceService.previewJoin(token);
      setPreview(res.data);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Enlace inválido o expirado');
    }
  };

  const handleJoin = async () => {
    setStatus('joining');
    try {
      const res = await workspaceService.joinByToken(token);
      await fetchWorkspaces();
      setStatus('success');
      toast.success(res.message || '¡Te uniste al workspace!');
      setTimeout(() => navigate('/dashboard'), 1800);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'No se pudo unir al workspace');
    }
  };

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-brand-500"/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px]
          bg-brand-500/8 rounded-full blur-3xl"/>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        <div className="card p-8 border-surface-700/60 text-center">
          {/* Logo */}
          <div className="w-11 h-11 rounded-2xl bg-brand-500 flex items-center justify-center shadow-glow-brand mx-auto mb-6">
            <Zap size={20} className="text-white" fill="white"/>
          </div>

          {status === 'error' && (
            <>
              <XCircle size={40} className="text-danger-400 mx-auto mb-4"/>
              <h2 className="font-display text-lg font-bold text-surface-100 mb-2">Enlace inválido</h2>
              <p className="text-surface-500 text-sm mb-6">{errorMsg}</p>
              <Link to="/dashboard" className="btn-primary w-full">Ir al dashboard</Link>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle2 size={40} className="text-success-400 mx-auto mb-4"/>
              <h2 className="font-display text-lg font-bold text-surface-100 mb-2">¡Te uniste!</h2>
              <p className="text-surface-500 text-sm">Redirigiendo al dashboard...</p>
            </>
          )}

          {(status === 'ready' || status === 'joining') && preview && (
            <>
              {/* Workspace preview */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white
                font-display font-bold text-2xl mx-auto mb-4"
                style={{ backgroundColor: preview.workspace.color }}>
                {preview.workspace.name[0].toUpperCase()}
              </div>

              <h2 className="font-display text-lg font-bold text-surface-100 mb-1">
                {preview.workspace.name}
              </h2>
              {preview.workspace.description && (
                <p className="text-surface-500 text-sm mb-3">{preview.workspace.description}</p>
              )}

              <div className="flex items-center justify-center gap-3 mb-6 text-xs text-surface-500">
                <span className="flex items-center gap-1.5">
                  <Users size={13}/> {preview.workspace.members_count} miembros
                </span>
                <span className={`badge text-2xs ${preview.role === 'admin' ? 'badge-brand' : 'badge-neutral'}`}>
                  Rol: {preview.role}
                </span>
              </div>

              <p className="text-surface-500 text-xs mb-5">
                Invitado por <strong className="text-surface-300">{preview.workspace.owner?.name}</strong>
              </p>

              <button onClick={handleJoin} disabled={status === 'joining'} className="btn-primary w-full h-11">
                {status === 'joining'
                  ? <Loader2 size={16} className="animate-spin"/>
                  : `Unirse a ${preview.workspace.name}`}
              </button>
              <Link to="/dashboard" className="block text-xs text-surface-600 hover:text-surface-400 mt-3">
                Cancelar
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default JoinWorkspacePage;
