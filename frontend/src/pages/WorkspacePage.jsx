import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, UserMinus, Link, Settings, Loader2, MoreHorizontal, Shield } from 'lucide-react';
import { useWorkspace } from '@context/WorkspaceContext';
import { useAuth } from '@context/AuthContext';
import { workspaceService } from '@services/workspaceService';
import InviteModal from '@components/workspace/InviteModal';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

const RoleBadge = ({ role }) => (
  <span className={clsx('badge text-2xs gap-1', role === 'admin' ? 'badge-brand' : 'badge-neutral')}>
    {role === 'admin' ? <Crown size={9}/> : <Users size={9}/>}
    {role === 'admin' ? 'Admin' : 'Miembro'}
  </span>
);

const WorkspacePage = () => {
  const { currentWorkspace } = useWorkspace();
  const { user }             = useAuth();
  const [members, setMembers]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  const isAdmin = currentWorkspace?.role === 'admin';

  useEffect(() => {
    if (currentWorkspace) loadMembers();
  }, [currentWorkspace]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await workspaceService.getMembers(currentWorkspace.id);
      setMembers(res.data?.members ?? []);
    } catch { toast.error('Error al cargar miembros'); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await workspaceService.updateMemberRole(currentWorkspace.id, memberId, newRole);
      setMembers(prev => prev.map(m => m.user.id === memberId ? { ...m, role: newRole } : m));
      toast.success('Rol actualizado');
    } catch (err) { toast.error(err.message); }
  };

  const handleRemove = async (memberId, memberName) => {
    if (!confirm(`¿Remover a ${memberName} del workspace?`)) return;
    try {
      await workspaceService.removeMember(currentWorkspace.id, memberId);
      setMembers(prev => prev.filter(m => m.user.id !== memberId));
      toast.success('Miembro removido');
    } catch (err) { toast.error(err.message); }
  };

  if (!currentWorkspace) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-64 text-center">
        <Users size={36} className="text-surface-700 mb-3"/>
        <h3 className="font-semibold text-surface-400">No tienes un workspace activo</h3>
        <p className="text-surface-600 text-sm mt-1">Crea o únete a uno desde el menú lateral</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white
            font-display font-bold text-xl shadow-lg"
            style={{ backgroundColor: currentWorkspace.color }}>
            {currentWorkspace.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-surface-100">{currentWorkspace.name}</h1>
            <p className="text-surface-500 text-sm">{currentWorkspace.description || 'Sin descripción'}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={() => setShowInvite(true)} className="btn-primary btn-sm gap-1.5">
              <Link size={14}/> Invitar
            </button>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Miembros',  value: members.length, icon: Users },
          { label: 'Tu rol',    value: currentWorkspace.role === 'admin' ? 'Admin' : 'Miembro', icon: Shield },
          { label: 'Creado',    value: currentWorkspace.created_at ? format(new Date(currentWorkspace.created_at), 'MMM yyyy', { locale: es }) : '—', icon: Settings }
        ].map(stat => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="card p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
              <stat.icon size={16} className="text-brand-400"/>
            </div>
            <div>
              <p className="text-lg font-bold font-display text-surface-100">{stat.value}</p>
              <p className="text-xs text-surface-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Members list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="card overflow-hidden">
        <div className="p-4 border-b border-surface-800 flex items-center justify-between">
          <h2 className="font-semibold text-surface-200 text-sm">Miembros del equipo</h2>
          {isAdmin && (
            <button onClick={() => setShowInvite(true)}
              className="btn-ghost btn-sm text-brand-400 hover:text-brand-300 gap-1">
              <Link size={13}/> Invitar miembros
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={22} className="animate-spin text-surface-600"/>
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {members.map((m, i) => (
              <motion.div key={m.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-800/30 transition-colors"
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-xl bg-brand-500/15 text-brand-400 text-sm font-bold
                  flex items-center justify-center shrink-0 border border-brand-500/20">
                  {m.user.name[0].toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-surface-200 truncate">{m.user.name}</p>
                    {m.user.id === user?.id && (
                      <span className="text-2xs text-surface-500 bg-surface-800 px-1.5 py-0.5 rounded">Tú</span>
                    )}
                    <RoleBadge role={m.role}/>
                  </div>
                  <p className="text-xs text-surface-500 truncate">{m.user.email}</p>
                </div>

                {/* Joined date */}
                <p className="text-xs text-surface-600 hidden sm:block shrink-0">
                  {m.joined_at ? format(new Date(m.joined_at), 'dd MMM yyyy', { locale: es }) : ''}
                </p>

                {/* Admin actions */}
                {isAdmin && m.user.id !== user?.id && (
                  <div className="flex items-center gap-1 shrink-0">
                    <select
                      value={m.role}
                      onChange={e => handleRoleChange(m.user.id, e.target.value)}
                      className="text-xs bg-surface-800 border border-surface-700 rounded-lg px-2 py-1
                        text-surface-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    >
                      <option value="member">Miembro</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button onClick={() => handleRemove(m.user.id, m.user.name)}
                      className="btn-icon btn-sm text-surface-600 hover:text-danger-400">
                      <UserMinus size={14}/>
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <InviteModal open={showInvite} onClose={() => setShowInvite(false)} workspace={currentWorkspace}/>
    </div>
  );
};

export default WorkspacePage;
