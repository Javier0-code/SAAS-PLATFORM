import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Trash2, Plus, Link, Loader2, RefreshCw } from 'lucide-react';
import { workspaceService } from '@services/workspaceService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const InviteModal = ({ open, onClose, workspace }) => {
  const [invites, setInvites]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied]     = useState(null);
  const [form, setForm]         = useState({ role: 'member', expires_in_days: 7, max_uses: '' });

  useEffect(() => {
    if (open && workspace) loadInvites();
  }, [open, workspace]);

  const loadInvites = async () => {
    setLoading(true);
    try {
      const res = await workspaceService.getInvites(workspace.id);
      setInvites(res.data?.invites ?? []);
    } catch { toast.error('Error al cargar invitaciones'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const payload = {
        role:            form.role,
        expires_in_days: parseInt(form.expires_in_days) || 7,
        max_uses:        form.max_uses ? parseInt(form.max_uses) : null
      };
      const res = await workspaceService.createInvite(workspace.id, payload);
      setInvites(prev => [res.data, ...prev]);
      toast.success('Enlace de invitación creado');
    } catch (err) { toast.error(err.message || 'Error al crear invitación'); }
    finally { setCreating(false); }
  };

  const handleRevoke = async (inviteId) => {
    try {
      await workspaceService.revokeInvite(workspace.id, inviteId);
      setInvites(prev => prev.filter(i => i.id !== inviteId));
      toast.success('Invitación revocada');
    } catch { toast.error('Error al revocar'); }
  };

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    toast.success('¡Enlace copiado!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg card p-6 border-surface-700 max-h-[80vh] flex flex-col"
          >
            <div className="flex items-center justify-between mb-5 shrink-0">
              <div>
                <h2 className="font-display font-semibold text-surface-100 text-lg">Invitar miembros</h2>
                <p className="text-xs text-surface-500 mt-0.5">{workspace?.name}</p>
              </div>
              <button onClick={onClose} className="btn-icon text-surface-500 hover:text-surface-300"><X size={18}/></button>
            </div>

            {/* Create new invite */}
            <div className="bg-surface-800/50 border border-surface-700/50 rounded-xl p-4 mb-4 shrink-0">
              <p className="text-xs font-semibold text-surface-300 mb-3">Generar nuevo enlace</p>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="input-group">
                  <label className="input-label">Rol</label>
                  <select className="input text-sm py-2" value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="member">Miembro</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Expira en</label>
                  <select className="input text-sm py-2" value={form.expires_in_days}
                    onChange={e => setForm(p => ({ ...p, expires_in_days: e.target.value }))}>
                    <option value={1}>1 día</option>
                    <option value={7}>7 días</option>
                    <option value={30}>30 días</option>
                    <option value={0}>Sin límite</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Máx. usos</label>
                  <input className="input text-sm py-2" type="number" placeholder="∞"
                    value={form.max_uses} onChange={e => setForm(p => ({ ...p, max_uses: e.target.value }))} min={1}/>
                </div>
              </div>
              <button onClick={handleCreate} disabled={creating} className="btn-primary btn-sm w-full gap-1.5">
                {creating ? <Loader2 size={13} className="animate-spin"/> : <><Plus size={13}/>Generar enlace</>}
              </button>
            </div>

            {/* Existing invites */}
            <div className="flex-1 overflow-y-auto scroll-area space-y-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-surface-400">Enlaces activos ({invites.length})</p>
                <button onClick={loadInvites} className="btn-ghost btn-sm p-1"><RefreshCw size={12}/></button>
              </div>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-surface-500"/>
                </div>
              )}

              {!loading && invites.length === 0 && (
                <div className="text-center py-8 text-surface-600">
                  <Link size={28} className="mx-auto mb-2 opacity-50"/>
                  <p className="text-sm">No hay enlaces activos</p>
                </div>
              )}

              {invites.map(inv => (
                <div key={inv.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/40
                  border border-surface-700/50 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge text-2xs ${inv.role === 'admin' ? 'badge-brand' : 'badge-neutral'}`}>
                        {inv.role}
                      </span>
                      {inv.expires_at && (
                        <span className="text-2xs text-surface-500">
                          Expira {format(new Date(inv.expires_at), 'dd MMM', { locale: es })}
                        </span>
                      )}
                      <span className="text-2xs text-surface-500">
                        {inv.uses_count}/{inv.max_uses ?? '∞'} usos
                      </span>
                    </div>
                    <p className="text-xs text-surface-500 font-mono truncate">{inv.invite_url}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleCopy(inv.invite_url, inv.id)}
                      className="btn-icon btn-sm text-surface-500 hover:text-surface-200">
                      {copied === inv.id ? <Check size={14} className="text-success-400"/> : <Copy size={14}/>}
                    </button>
                    <button onClick={() => handleRevoke(inv.id)}
                      className="btn-icon btn-sm text-surface-500 hover:text-danger-400">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default InviteModal;
