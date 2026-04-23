import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Plus, Hash } from 'lucide-react';
import { useWorkspace } from '@context/WorkspaceContext';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import clsx from 'clsx';

const WorkspaceSwitcher = ({ collapsed }) => {
  const { workspaces, currentWorkspace, switchWorkspace } = useWorkspace();
  const [open, setOpen]           = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (collapsed) {
    return (
      <div className="px-3 mt-2 mb-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto"
          style={{ backgroundColor: currentWorkspace?.color || '#6172f3' }}>
          {currentWorkspace?.name?.[0]?.toUpperCase() || <Hash size={14}/>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-3 mt-3 mb-1 relative" ref={ref}>
        <button
          onClick={() => setOpen(p => !p)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
            bg-surface-800/50 hover:bg-surface-800 border border-surface-700/50
            transition-colors duration-150 group"
        >
          {currentWorkspace ? (
            <div className="w-5 h-5 rounded flex items-center justify-center text-white text-2xs font-bold shrink-0"
              style={{ backgroundColor: currentWorkspace.color }}>
              {currentWorkspace.name[0].toUpperCase()}
            </div>
          ) : (
            <div className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center shrink-0">
              <Hash size={10} className="text-brand-400"/>
            </div>
          )}
          <div className="flex-1 text-left overflow-hidden">
            <p className="text-xs font-semibold text-surface-300 truncate">
              {currentWorkspace?.name || 'Sin workspace'}
            </p>
            <p className="text-2xs text-surface-500 truncate">
              {currentWorkspace ? `Rol: ${currentWorkspace.role}` : 'Crea o únete a uno'}
            </p>
          </div>
          <ChevronDown size={13} className={clsx(
            'text-surface-500 shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}/>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1.5
                bg-surface-800 border border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {/* Workspaces list */}
              <div className="p-1.5 max-h-48 overflow-y-auto">
                {workspaces.length === 0 && (
                  <p className="text-xs text-surface-500 text-center py-3">No tienes workspaces aún</p>
                )}
                {workspaces.map(ws => (
                  <button key={ws.id}
                    onClick={() => { switchWorkspace(ws); setOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                      hover:bg-surface-700 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-2xs font-bold shrink-0"
                      style={{ backgroundColor: ws.color }}>
                      {ws.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-surface-200 truncate">{ws.name}</p>
                      <p className="text-2xs text-surface-500">{ws.role}</p>
                    </div>
                    {currentWorkspace?.id === ws.id && (
                      <Check size={13} className="text-brand-400 shrink-0"/>
                    )}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="border-t border-surface-700 p-1.5">
                <button
                  onClick={() => { setOpen(false); setShowCreate(true); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                    text-xs font-medium text-brand-400 hover:bg-brand-500/10 transition-colors"
                >
                  <Plus size={14}/> Crear workspace
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateWorkspaceModal open={showCreate} onClose={() => setShowCreate(false)} />
    </>
  );
};

export default WorkspaceSwitcher;
