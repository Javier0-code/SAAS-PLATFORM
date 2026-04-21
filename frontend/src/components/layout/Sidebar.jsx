import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Calendar,
  StickyNote, Bell, Users, Settings, ChevronLeft,
  Zap, Plus, Hash
} from 'lucide-react';
import { useAuth } from '@context/AuthContext';
import clsx from 'clsx';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/dashboard' },
  { icon: FolderKanban,    label: 'Proyectos',    path: '/dashboard/projects',  soon: true },
  { icon: CheckSquare,     label: 'Tareas',       path: '/dashboard/tasks',     soon: true },
  { icon: Calendar,        label: 'Reuniones',    path: '/dashboard/meetings',  soon: true },
  { icon: StickyNote,      label: 'Notas',        path: '/dashboard/notes',     soon: true },
  { icon: Bell,            label: 'Notificaciones', path: '/dashboard/notifications', soon: true },
];

const BOTTOM_ITEMS = [
  { icon: Users,    label: 'Equipo',      path: '/dashboard/team',     soon: true },
  { icon: Settings, label: 'Ajustes',     path: '/dashboard/settings', soon: true },
];

const SidebarItem = ({ item, collapsed }) => {
  const { icon: Icon, label, path, soon } = item;

  if (soon) {
    return (
      <div
        className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
          'text-surface-600 cursor-not-allowed select-none'
        )}
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

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = useAuth();

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="flex flex-col h-full bg-surface-900 border-r border-surface-800 shrink-0 overflow-hidden"
      style={{ willChange: 'width' }}
    >
      {/* Logo / Brand */}
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
          <button
            onClick={onToggle}
            className="btn-icon text-surface-500 hover:text-surface-300 ml-auto"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Workspace selector placeholder */}
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
        {/* Main nav */}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(item => (
            <SidebarItem key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-surface-800" />

        {/* Bottom nav */}
        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map(item => (
            <SidebarItem key={item.path} item={item} collapsed={collapsed} />
          ))}
        </div>
      </nav>

      {/* User profile */}
      <div className="border-t border-surface-800 p-3 shrink-0">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="avatar-md bg-brand-500/20 text-brand-400 text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-1">
            <div className="avatar-md bg-brand-500/20 text-brand-400 text-xs font-bold shrink-0">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-2xs text-surface-500 truncate">
                {user?.email || 'Conecta en Etapa 2'}
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
