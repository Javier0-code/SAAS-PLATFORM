import { motion } from 'framer-motion';
import {
  CheckSquare, FolderKanban, Calendar, Users,
  TrendingUp, Zap, ArrowRight
} from 'lucide-react';

const roadmap = [
  { stage: 1, label: 'Configuración del proyecto',  status: 'done' },
  { stage: 2, label: 'Autenticación (OAuth)',         status: 'pending' },
  { stage: 3, label: 'Equipos / Workspaces',          status: 'pending' },
  { stage: 4, label: 'Proyectos',                     status: 'pending' },
  { stage: 5, label: 'Tareas — Kanban',               status: 'pending' },
  { stage: 6, label: 'Comentarios',                   status: 'pending' },
  { stage: 7, label: 'Reuniones — Calendario',        status: 'pending' },
  { stage: 8, label: 'Notas privadas',                status: 'pending' },
  { stage: 9, label: 'Notificaciones',                status: 'pending' },
  { stage: 10, label: 'Tiempo real (Socket.io)',      status: 'pending' },
  { stage: 11, label: 'Historial de actividad',       status: 'pending' },
  { stage: 12, label: 'UI/UX profesional',            status: 'pending' },
  { stage: 13, label: 'Escalabilidad',                status: 'pending' },
];

const stats = [
  { icon: CheckSquare,  label: 'Tareas pendientes',  value: '—', color: 'text-brand-400',   bg: 'bg-brand-500/10' },
  { icon: FolderKanban, label: 'Proyectos activos',  value: '—', color: 'text-success-400', bg: 'bg-success-500/10' },
  { icon: Calendar,     label: 'Reuniones hoy',      value: '—', color: 'text-warning-400', bg: 'bg-warning-500/10' },
  { icon: Users,        label: 'Miembros del equipo',value: '—', color: 'text-info-400',    bg: 'bg-info-500/10' },
];

const DashboardPage = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-100">Dashboard</h1>
          <p className="text-surface-500 text-sm mt-0.5">Bienvenido a tu plataforma SaaS</p>
        </div>
        <div className="badge-brand px-3 py-1.5 text-xs gap-2">
          <Zap size={12} />
          Etapa 1 completada
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon size={16} className={s.color} />
              </div>
              <TrendingUp size={14} className="text-surface-600" />
            </div>
            <p className="text-2xl font-bold font-display text-surface-200">{s.value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-surface-100">Roadmap de desarrollo</h2>
          <span className="badge-success text-2xs">1 / 13 etapas</span>
        </div>

        <div className="space-y-2">
          {roadmap.map((item, i) => (
            <motion.div
              key={item.stage}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.03 }}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                item.status === 'done'
                  ? 'bg-success-500/8 border border-success-500/20'
                  : 'bg-surface-800/30 border border-transparent'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-2xs font-bold shrink-0 ${
                item.status === 'done'
                  ? 'bg-success-500 text-white'
                  : 'bg-surface-700 text-surface-500'
              }`}>
                {item.stage}
              </div>
              <span className={`text-sm flex-1 ${
                item.status === 'done' ? 'text-surface-200' : 'text-surface-500'
              }`}>
                {item.label}
              </span>
              {item.status === 'done' && (
                <span className="badge-success text-2xs">✓ Hecho</span>
              )}
              {item.status === 'pending' && item.stage === 2 && (
                <span className="badge-brand text-2xs gap-1">
                  <ArrowRight size={10} /> Siguiente
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

    </div>
  );
};

export default DashboardPage;
