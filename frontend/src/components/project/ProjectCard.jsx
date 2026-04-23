import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, MoreHorizontal, Pencil, Trash2,
  Tag, Calendar, CheckSquare, Archive
} from 'lucide-react';
import { useToggleFavorite, useDeleteProject, useUpdateProject } from '@hooks/useProjects';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

const STATUS_LABELS = {
  active:    { label: 'Activo',     cls: 'badge-success' },
  archived:  { label: 'Archivado',  cls: 'badge-neutral' },
  completed: { label: 'Completado', cls: 'badge-brand'   }
};

const ProjectCard = ({ project, onEdit }) => {
  const navigate       = useNavigate();
  const toggleFav      = useToggleFavorite();
  const deleteProject  = useDeleteProject();
  const updateProject  = useUpdateProject();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm(`¿Eliminar "${project.name}"? Esta acción no se puede deshacer.`)) return;
    deleteProject.mutate(project.id);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    const newStatus = project.status === 'archived' ? 'active' : 'archived';
    updateProject.mutate({ id: project.id, data: { status: newStatus } });
    setMenuOpen(false);
  };

  const status = STATUS_LABELS[project.status] ?? STATUS_LABELS.active;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="card p-4 cursor-pointer hover:border-surface-700 transition-all group relative"
      onClick={() => navigate(`/dashboard/projects/${project.id}`)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Icon + color */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
            style={{ backgroundColor: project.color + '25', border: `1px solid ${project.color}40` }}>
            {project.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-surface-100 text-sm truncate leading-tight">{project.name}</h3>
            <span className={`badge text-2xs mt-0.5 ${status.cls}`}>{status.label}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Favorite */}
          <button
            onClick={e => { e.stopPropagation(); toggleFav.mutate(project.id); }}
            className={clsx(
              'btn-icon btn-sm transition-colors',
              project.is_favorite ? 'text-warning-400' : 'text-surface-600 hover:text-warning-400'
            )}
          >
            <Star size={14} fill={project.is_favorite ? 'currentColor' : 'none'}/>
          </button>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(p => !p); }}
              className="btn-icon btn-sm text-surface-600 hover:text-surface-300"
            >
              <MoreHorizontal size={14}/>
            </button>

            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 w-40 bg-surface-800 border border-surface-700
                  rounded-xl shadow-xl z-20 overflow-hidden p-1"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={e => { e.stopPropagation(); setMenuOpen(false); onEdit(project); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-surface-300
                    hover:bg-surface-700 rounded-lg transition-colors">
                  <Pencil size={13}/> Editar
                </button>
                <button onClick={handleArchive}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-surface-300
                    hover:bg-surface-700 rounded-lg transition-colors">
                  <Archive size={13}/>
                  {project.status === 'archived' ? 'Activar' : 'Archivar'}
                </button>
                <div className="border-t border-surface-700 my-1"/>
                <button onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-danger-400
                    hover:bg-danger-500/10 rounded-lg transition-colors">
                  <Trash2 size={13}/> Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-surface-500 mb-3 line-clamp-2">{project.description}</p>
      )}

      {/* Tags */}
      {project.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 text-2xs px-2 py-0.5
              bg-surface-800 text-surface-400 rounded-full border border-surface-700">
              <Tag size={9}/>{tag}
            </span>
          ))}
          {project.tags.length > 3 && (
            <span className="text-2xs text-surface-600">+{project.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-surface-800">
        <div className="flex items-center gap-3 text-xs text-surface-600">
          <span className="flex items-center gap-1">
            <CheckSquare size={11}/>{project.task_count ?? 0} tareas
          </span>
          {project.due_date && (
            <span className="flex items-center gap-1">
              <Calendar size={11}/>
              {format(new Date(project.due_date), 'dd MMM', { locale: es })}
            </span>
          )}
        </div>
        {/* Owner avatar */}
        {project.owner && (
          <div className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-2xs font-bold
            flex items-center justify-center border border-brand-500/20"
            title={project.owner.name}>
            {project.owner.name[0].toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProjectCard;
