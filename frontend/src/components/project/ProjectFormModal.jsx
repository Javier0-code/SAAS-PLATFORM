import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Tag, Plus } from 'lucide-react';
import { useCreateProject, useUpdateProject } from '@hooks/useProjects';
import { useWorkspace } from '@context/WorkspaceContext';

const COLORS  = ['#6172f3','#8b5cf6','#ec4899','#ef4444','#f59e0b','#10b981','#06b6d4','#3b82f6','#84cc16'];
const ICONS   = ['📁','🚀','💡','🎯','⚡','🔥','🌟','🛠️','📊','🎨','🌿','💎'];
const STATUSES = [
  { value: 'active',    label: 'Activo'     },
  { value: 'completed', label: 'Completado' },
  { value: 'archived',  label: 'Archivado'  }
];

const DEFAULT = { name:'', description:'', color:'#6172f3', icon:'📁', status:'active', tags:[], start_date:'', due_date:'' };

const ProjectFormModal = ({ open, onClose, project = null }) => {
  const { currentWorkspace }  = useWorkspace();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const isEdit = !!project;

  const [form, setForm]     = useState(DEFAULT);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (project) {
      setForm({
        name:        project.name        ?? '',
        description: project.description ?? '',
        color:       project.color       ?? '#6172f3',
        icon:        project.icon        ?? '📁',
        status:      project.status      ?? 'active',
        tags:        project.tags        ?? [],
        start_date:  project.start_date  ?? '',
        due_date:    project.due_date    ?? ''
      });
    } else {
      setForm(DEFAULT);
    }
  }, [project, open]);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) setForm(p => ({ ...p, tags: [...p.tags, t] }));
    setTagInput('');
  };
  const removeTag = (t) => setForm(p => ({ ...p, tags: p.tags.filter(x => x !== t) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      start_date: form.start_date || null,
      due_date:   form.due_date   || null
    };

    if (isEdit) {
      updateProject.mutate({ id: project.id, data: payload }, { onSuccess: onClose });
    } else {
      createProject.mutate(
        { ...payload, workspace_id: currentWorkspace?.id },
        { onSuccess: onClose }
      );
    }
  };

  const isPending = createProject.isPending || updateProject.isPending;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}/>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg card p-6 border-surface-700 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-surface-100 text-lg">
                {isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
              </h2>
              <button onClick={onClose} className="btn-icon text-surface-500 hover:text-surface-300">
                <X size={18}/>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-800/40 border border-surface-700/50">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: form.color + '25', border: `1px solid ${form.color}50` }}>
                  {form.icon}
                </div>
                <div>
                  <p className="font-semibold text-surface-100 text-sm">{form.name || 'Nombre del proyecto'}</p>
                  <p className="text-xs text-surface-500">{form.description || 'Sin descripción'}</p>
                </div>
              </div>

              {/* Name */}
              <div className="input-group">
                <label className="input-label">Nombre *</label>
                <input className="input" placeholder="Ej: App móvil, Rediseño web..." value={form.name}
                  onChange={set('name')} maxLength={150} autoFocus required/>
              </div>

              {/* Description */}
              <div className="input-group">
                <label className="input-label">Descripción</label>
                <textarea className="input resize-none h-20 py-2.5" value={form.description}
                  onChange={set('description')} placeholder="¿De qué trata este proyecto?"/>
              </div>

              {/* Icon */}
              <div className="input-group">
                <label className="input-label">Ícono</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all
                        ${form.icon === ic ? 'bg-brand-500/20 border-2 border-brand-500/50 scale-110' : 'bg-surface-800 hover:bg-surface-700 border border-surface-700'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="input-group">
                <label className="input-label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                      className="w-7 h-7 rounded-lg border-2 transition-all"
                      style={{
                        backgroundColor: c,
                        borderColor: form.color === c ? 'white' : 'transparent',
                        transform:   form.color === c ? 'scale(1.2)' : 'scale(1)'
                      }}/>
                  ))}
                </div>
              </div>

              {/* Status (solo en edit) */}
              {isEdit && (
                <div className="input-group">
                  <label className="input-label">Estado</label>
                  <select className="input" value={form.status} onChange={set('status')}>
                    {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div className="input-group">
                  <label className="input-label">Inicio</label>
                  <input type="date" className="input" value={form.start_date} onChange={set('start_date')}/>
                </div>
                <div className="input-group">
                  <label className="input-label">Fecha límite</label>
                  <input type="date" className="input" value={form.due_date} onChange={set('due_date')}/>
                </div>
              </div>

              {/* Tags */}
              <div className="input-group">
                <label className="input-label">Etiquetas</label>
                <div className="flex gap-2">
                  <input className="input flex-1" placeholder="Agrega una etiqueta..."
                    value={tagInput} onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}/>
                  <button type="button" onClick={addTag} className="btn-secondary px-3"><Plus size={15}/></button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 text-xs px-2.5 py-1
                        bg-brand-500/10 text-brand-400 rounded-full border border-brand-500/20">
                        <Tag size={10}/>{t}
                        <button type="button" onClick={() => removeTag(t)}
                          className="ml-0.5 hover:text-danger-400 transition-colors">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={!form.name.trim() || isPending} className="btn-primary flex-1">
                  {isPending
                    ? <Loader2 size={15} className="animate-spin"/>
                    : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProjectFormModal;
