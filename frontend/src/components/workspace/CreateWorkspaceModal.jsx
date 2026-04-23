import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Loader2 } from 'lucide-react';
import { workspaceService } from '@services/workspaceService';
import { useWorkspace } from '@context/WorkspaceContext';
import toast from 'react-hot-toast';

const COLORS = [
  '#6172f3','#8b5cf6','#ec4899','#ef4444',
  '#f59e0b','#10b981','#06b6d4','#3b82f6',
];

const CreateWorkspaceModal = ({ open, onClose }) => {
  const { addWorkspace } = useWorkspace();
  const [name, setName]   = useState('');
  const [desc, setDesc]   = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await workspaceService.create({ name: name.trim(), description: desc.trim(), color });
      addWorkspace(res.data);
      toast.success(`Workspace "${res.data.name}" creado 🎉`);
      onClose();
      setName(''); setDesc(''); setColor(COLORS[0]);
    } catch (err) {
      toast.error(err.message || 'Error al crear el workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md card p-6 border-surface-700"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-surface-100 text-lg">Nuevo workspace</h2>
              <button onClick={onClose} className="btn-icon text-surface-500 hover:text-surface-300">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-800/50 border border-surface-700/50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                  style={{ backgroundColor: color }}>
                  {name.trim()[0]?.toUpperCase() || <Zap size={18}/>}
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-100">{name.trim() || 'Nombre del workspace'}</p>
                  <p className="text-xs text-surface-500">{desc.trim() || 'Descripción opcional'}</p>
                </div>
              </div>

              {/* Name */}
              <div className="input-group">
                <label className="input-label">Nombre *</label>
                <input className="input" placeholder="Ej: Mi Empresa, Proyecto Alpha..."
                  value={name} onChange={e => setName(e.target.value)} maxLength={100} autoFocus />
              </div>

              {/* Description */}
              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea className="input resize-none h-20 py-2.5" placeholder="¿Para qué es este workspace?"
                  value={desc} onChange={e => setDesc(e.target.value)} maxLength={300} />
              </div>

              {/* Color */}
              <div className="input-group">
                <label className="input-label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setColor(c)}
                      className="w-7 h-7 rounded-lg transition-all duration-150 border-2"
                      style={{
                        backgroundColor: c,
                        borderColor: color === c ? 'white' : 'transparent',
                        transform: color === c ? 'scale(1.15)' : 'scale(1)'
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={!name.trim() || loading} className="btn-primary flex-1">
                  {loading ? <Loader2 size={15} className="animate-spin"/> : 'Crear workspace'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateWorkspaceModal;
