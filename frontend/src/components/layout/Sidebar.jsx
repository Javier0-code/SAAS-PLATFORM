import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Calendar,
  StickyNote, Bell, Users, Settings, ChevronLeft,
  Zap, Plus, Hash, LogOut, ChevronUp, User
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/dashboard' },
  { icon: FolderKanban,    label: 'Proyectos',      path: '/dashboard/projects' },
  { icon: CheckSquare,     label: 'Tareas',         path: '/dashboard/tasks',        soon: true },
  { icon: Calendar,        label: 'Reuniones',      path: '/dashboard/meetings',     soon: true },
  { icon: StickyNote,      label: 'Notas',          path: '/dashboard/notes',        soon: true },
  { icon: Bell,            label: 'Notificaciones', path: '/dashboard/notifications', soon: true },
];

const BOTTOM_ITEMS = [
  { icon: Users,    label: 'Equipo',  path: '/dashboard/team' },
  { icon: Settings, label: 'Ajustes', path: '/dashboard/settings', soon: true },
];

// ── Sidebar item ─────────────────────────────────────────
const SidebarItem = ({ item, collapsed }) => {
  const { icon: Icon, label, path, soon } = item;

  if (soon) {
    return (
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
          text-surface-600 cursor-not-allowed select-none"
        title={collapsed ? label : undefined}
      >
        <Icon size={18} className="shrink-0" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 flex items-center justify-between overflow-hidden whitespace-nowrap"
            >
              {label}
              <span className="text-2xs bg-surface-800 text-surface-500 px-1.5 py-0.5 rounded font-medium">
                Pronto
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={path}
      end={path === '/dashboard'}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-brand-500/10 text-brand-400'
            : 'text-surface-400 hover:text-surface-100 hover:bg-surface-800/70'
        )
      }
      title={collapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
};

// ── User menu popup ──────────────────────────────────────
const UserMenu = ({ user, onLogout, onClose }) => {
  const menuRef = useRef(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-1
        bg-surface-800 border border-surface-700 rounded-xl shadow-xl overflow-hidden z-50"
    >
      {/* User info */}
      <div className="px-4 py-3 border-b border-surface-700">
        <p className="text-sm font-semibold text-surface-100 truncate">{user?.name}</p>
        <p className="text-xs text-surface-500 truncate">{user?.email}</p>
        <span className="inline-flex items-center gap-1 mt-1.5 text-2xs text-brand-400
          bg-brand-500/10 px-2 py-0.5 rounded-full">
          {user?.auth_provider === 'google' ? '🔵 Google' :
           user?.auth_provider === 'apple'  ? '⚫ Apple'  : '✉️ Email'}
        </span>
      </div>

      {/* Menu items */}
      <div className="p-1.5">
        <button
          disabled
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
            text-surface-500 cursor-not-allowed"
        >
          <User size={15} />
          Mi perfil
          <span className="ml-auto text-2xs text-surface-600">Pronto</span>
        </button>

        <button
          disabled
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
            text-surface-500 cursor-not-allowed"
        >
          <Settings size={15} />
          Ajustes
          <span className="ml-auto text-2xs text-surface-600">Pronto</span>
        </button>

        <div className="border-t border-surface-700 my-1" />

        {/* LOGOUT BUTTON */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
            text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 transition-colors"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </motion.div>
  );
};

// ── Main Sidebar ─────────────────────────────────────────
const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logout();
      toast.success('Sesión cerrada');
      navigate('/login', { replace: true });
    } catch {
      // logout() en AuthContext ya limpia tokens aunque falle la API
      navigate('/login', { replace: true });
    }
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-surface-900 border-r border-surface-800 shrink-0 overflow-hidden"
      style={{ willChange: 'width' }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-14 px-4 border-b border-surface-800 shrink-0">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-brand shrink-0">
                <Zap size={14} className="text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-surface-100 whitespace-nowrap text-[15px]">
                SaaS Platform
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center mx-auto shadow-glow-brand">
            <Zap size={14} className="text-white" fill="white" />
          </div>
        )}

        {!collapsed && (
          <button onClick={onToggle} className="btn-icon text-surface-500 hover:text-surface-300 ml-auto">
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Workspace selector */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-3 mt-3 mb-1"
          >
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
              bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50
              transition-colors duration-150 group">
              <div className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center shrink-0">
                <Hash size={10} className="text-brand-400" />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-xs font-semibold text-surface-300 truncate">Mi Workspace</p>
                <p className="text-2xs text-surface-500 truncate">Etapa 3: Equipos</p>
              </div>
              <Plus size={14} className="text-surface-500 group-hover:text-surface-300 shrink-0" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-2 space-y-0.5 scroll-area">
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <SidebarItem key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>
        <div className="my-3 border-t border-surface-800" />
        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map(item => (
            <SidebarItem key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* User section con menú de logout */}
      <div className="border-t border-surface-800 p-2 shrink-0 relative">

        <AnimatePresence>
          {menuOpen && (
            <UserMenu user={user} onLogout={handleLogout} onClose={() => setMenuOpen(false)} />
          )}
        </AnimatePresence>

        <button
          onClick={() => setMenuOpen(p => !p)}
          className={clsx(
            'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors duration-150',
            menuOpen
              ? 'bg-surface-800 text-surface-100'
              : 'hover:bg-surface-800/70 text-surface-300'
          )}
          title={collapsed ? 'Menú de usuario' : undefined}
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-bold
            flex items-center justify-center shrink-0 border border-brand-500/20">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 flex items-center justify-between overflow-hidden min-w-0"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-surface-200 truncate leading-tight">
                    {user?.name || 'Usuario'}
                  </p>
                  <p className="text-2xs text-surface-500 truncate">
                    {user?.email || ''}
                  </p>
                </div>
                <ChevronUp
                  size={13}
                  className={clsx(
                    'text-surface-500 shrink-0 ml-2 transition-transform duration-200',
                    menuOpen ? 'rotate-180' : ''
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* Logout rápido cuando sidebar colapsado */}
        {collapsed && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center mt-1 p-2 rounded-lg
              text-surface-600 hover:text-danger-400 hover:bg-danger-500/10 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut size={15} />
          </button>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
