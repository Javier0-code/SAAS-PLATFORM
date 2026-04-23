import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Star, Filter, Grid3X3, List,
  FolderKanban, Globe, Tag, ChevronDown, Loader2
} from 'lucide-react';
import { useProjects, useAllProjects, useProjectTags } from '@hooks/useProjects';
import { useWorkspace } from '@context/WorkspaceContext';
import ProjectCard from '@components/project/ProjectCard';
import ProjectFormModal from '@components/project/ProjectFormModal';
import clsx from 'clsx';

const STATUS_OPTS = [
  { value: '',          label: 'Todos' },
  { value: 'active',    label: 'Activos' },
  { value: 'completed', label: 'Completados' },
  { value: 'archived',  label: 'Archivados' }
];

const ProjectsPage = () => {
  const { currentWorkspace } = useWorkspace();
  const [showForm, setShowForm]         = useState(false);
  const [editProject, setEditProject]   = useState(null);
  const [viewMode, setViewMode]         = useState('grid');   // grid | list
  const [globalView, setGlobalView]     = useState(false);    // todos los workspaces
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter]       = useState('');
  const [favOnly, setFavOnly]           = useState(false);

  const filters = {
    status:    statusFilter || undefined,
    tag:       tagFilter    || undefined,
    favorites: favOnly ? 'true' : undefined
  };

  const { data: wsProjects,  isLoading: wsLoading  } = useProjects(filters);
  const { data: allProjects, isLoading: allLoading } = useAllProjects(filters);
  const { data: tags = [] } = useProjectTags();

  const projects = globalView ? (allProjects ?? []) : (wsProjects ?? []);
  const isLoading = globalView ? allLoading : wsLoading;

  // Client-side search
  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p) => { setEditProject(p); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditProject(null); };

  const EmptyState = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
        <FolderKanban size={28} className="text-surface-600"/>
      </div>
      <h3 className="font-display font-semibold text-surface-300 text-lg mb-2">
        {search || statusFilter || tagFilter ? 'Sin resultados' : 'No hay proyectos aún'}
      </h3>
      <p className="text-surface-600 text-sm mb-6 max-w-xs">
        {search || statusFilter || tagFilter
          ? 'Prueba con otros filtros'
          : 'Crea tu primer proyecto para empezar a organizar tu trabajo'}
      </p>
      {!search && !statusFilter && !tagFilter && (
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus size={16}/> Crear proyecto
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-100">Proyectos</h1>
          <p className="text-surface-500 text-sm mt-0.5">
            {globalView ? 'Todos tus proyectos' : currentWorkspace?.name ?? 'Selecciona un workspace'}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary gap-2">
          <Plus size={16}/> Nuevo proyecto
        </button>
      </motion.div>

      {/* Toolbar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"/>
          <input className="input pl-9 h-9 text-sm" placeholder="Buscar proyectos..."
            value={search} onChange={e => setSearch(e.target.value)}/>
        </div>

        {/* Status filter */}
        <div className="relative">
          <select className="input h-9 text-sm pr-8 pl-3 appearance-none cursor-pointer min-w-[130px]"
            value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"/>
        </div>

        {/* Tag filter */}
        {tags.length > 0 && (
          <div className="relative">
            <select className="input h-9 text-sm pr-8 pl-3 appearance-none cursor-pointer min-w-[120px]"
              value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
              <option value="">Todas las tags</option>
              {tags.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none"/>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {/* Favorites toggle */}
          <button
            onClick={() => setFavOnly(p => !p)}
            className={clsx('btn-sm gap-1.5 px-3 h-9 rounded-lg transition-all',
              favOnly ? 'bg-warning-500/15 text-warning-400 border border-warning-500/30' : 'btn-secondary')}
          >
            <Star size={13} fill={favOnly ? 'currentColor' : 'none'}/> Favoritos
          </button>

          {/* Global view */}
          <button
            onClick={() => setGlobalView(p => !p)}
            className={clsx('btn-sm gap-1.5 px-3 h-9 rounded-lg transition-all',
              globalView ? 'bg-brand-500/15 text-brand-400 border border-brand-500/30' : 'btn-secondary')}
          >
            <Globe size={13}/> Global
          </button>

          {/* View mode */}
          <div className="flex bg-surface-800 rounded-lg p-0.5 border border-surface-700">
            {[['grid', Grid3X3], ['list', List]].map(([mode, Icon]) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={clsx('p-1.5 rounded-md transition-all', viewMode === mode
                  ? 'bg-surface-700 text-surface-200' : 'text-surface-500 hover:text-surface-300')}>
                <Icon size={14}/>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-surface-600"/>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState/>
      ) : (
        <AnimatePresence mode="popLayout">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filtered.map(p => (
                <ProjectCard key={p.id} project={p} onEdit={openEdit}/>
              ))}
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="card overflow-hidden divide-y divide-surface-800">
              {filtered.map((p, i) => (
                <motion.div key={p.id}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-surface-800/30 cursor-pointer group"
                  onClick={() => {}}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                    style={{ backgroundColor: p.color + '25' }}>{p.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{p.name}</p>
                    {p.description && <p className="text-xs text-surface-500 truncate">{p.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {p.tags?.slice(0, 2).map(t => (
                      <span key={t} className="text-2xs px-2 py-0.5 bg-surface-800 text-surface-500 rounded-full border border-surface-700">
                        {t}
                      </span>
                    ))}
                    {p.is_favorite && <Star size={13} className="text-warning-400" fill="currentColor"/>}
                    <span className={clsx('badge text-2xs',
                      p.status === 'active' ? 'badge-success' :
                      p.status === 'completed' ? 'badge-brand' : 'badge-neutral')}>
                      {p.status}
                    </span>
                    <button onClick={e => { e.stopPropagation(); openEdit(p); }}
                      className="btn-ghost btn-sm opacity-0 group-hover:opacity-100 p-1">
                      <Filter size={13}/>
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Modals */}
      <ProjectFormModal open={showForm} onClose={closeForm} project={editProject}/>
    </div>
  );
};

export default ProjectsPage;
