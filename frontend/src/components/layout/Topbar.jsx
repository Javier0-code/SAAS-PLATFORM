import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, Bell, Plus, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';

const Topbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Sesión cerrada');
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-14 bg-surface-900 border-b border-surface-800 flex items-center px-4 gap-3 shrink-0">
      {/* Menu toggle mobile */}
      <button onClick={onMenuToggle} className="btn-icon text-surface-400 hover:text-surface-100 lg:hidden">
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar tareas, proyectos..."
            className="input pl-9 py-2 text-sm bg-surface-800/50 border-surface-700/50 placeholder-surface-600 h-9"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs text-surface-600
            bg-surface-700/50 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
        </div>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button className="btn-primary btn-sm gap-1.5">
          <Plus size={14} />
          <span className="hidden sm:inline">Nuevo</span>
        </button>

        <button className="btn-icon text-surface-400 hover:text-surface-100 relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropdownOpen(p => !p)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-bold
              flex items-center justify-center border border-brand-500/20">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm text-surface-300 max-w-[100px] truncate">
              {user?.name?.split(' ')[0] || 'Usuario'}
            </span>
            <ChevronDown size={13} className={`text-surface-500 hidden sm:block transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52
                  bg-surface-800 border border-surface-700 rounded-xl shadow-xl overflow-hidden z-50"
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-surface-700">
                  <p className="text-sm font-semibold text-surface-100 truncate">{user?.name}</p>
                  <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button disabled className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    text-sm text-surface-500 cursor-not-allowed">
                    <User size={15}/> Mi perfil
                    <span className="ml-auto text-2xs text-surface-600">Pronto</span>
                  </button>
                  <button disabled className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
                    text-sm text-surface-500 cursor-not-allowed">
                    <Settings size={15}/> Ajustes
                    <span className="ml-auto text-2xs text-surface-600">Pronto</span>
                  </button>

                  <div className="border-t border-surface-700 my-1" />

                  {/* LOGOUT */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                      text-danger-400 hover:text-danger-300 hover:bg-danger-500/10 transition-colors"
                  >
                    <LogOut size={15} />
                    Cerrar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
