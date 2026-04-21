import { Menu, Search, Bell, Plus, ChevronDown } from 'lucide-react';
import { useAuth } from '@context/AuthContext';

const Topbar = ({ onMenuToggle }) => {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-surface-900 border-b border-surface-800 flex items-center px-4 gap-3 shrink-0">
      {/* Menu toggle (mobile / collapsed) */}
      <button onClick={onMenuToggle} className="btn-icon text-surface-400 hover:text-surface-100 lg:hidden">
        <Menu size={18} />
      </button>

      {/* Search bar */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar tareas, proyectos, personas..."
            className="input pl-9 py-2 text-sm bg-surface-800/50 border-surface-700/50
              placeholder-surface-600 h-9"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-surface-600
            bg-surface-700/50 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* New button */}
        <button className="btn-primary btn-sm gap-1.5">
          <Plus size={14} />
          <span className="hidden sm:inline">Nuevo</span>
        </button>

        {/* Notifications */}
        <button className="btn-icon text-surface-400 hover:text-surface-100 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* User menu */}
        <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-800 transition-colors">
          <div className="avatar-sm bg-brand-500/20 text-brand-400 text-2xs font-bold">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <ChevronDown size={14} className="text-surface-500 hidden sm:block" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
