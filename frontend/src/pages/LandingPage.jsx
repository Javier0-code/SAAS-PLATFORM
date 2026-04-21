import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, CheckCircle2, ArrowRight, Users, BarChart3, Calendar } from 'lucide-react';

const features = [
  { icon: CheckCircle2, title: 'Gestión de tareas',  desc: 'Kanban con drag & drop, estados, progreso y asignación.' },
  { icon: Users,        title: 'Trabajo en equipo',   desc: 'Workspaces compartidos, roles, invitaciones y colaboración.' },
  { icon: Calendar,     title: 'Reuniones',           desc: 'Calendario interactivo con drag & drop y recordatorios.' },
  { icon: BarChart3,    title: 'Dashboard',           desc: 'Vista global de proyectos, tareas y actividad del equipo.' },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-950 text-surface-100 overflow-hidden">
      {/* Nav */}
      <nav className="border-b border-surface-800 bg-surface-900/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-brand">
              <Zap size={14} className="text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-surface-100 text-[15px]">SaaS Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-ghost btn-sm">Iniciar sesión</Link>
            <Link to="/login" className="btn-primary btn-sm">Comenzar gratis →</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-20 px-6 text-center">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
            bg-brand-500/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 badge-brand mb-6 text-xs px-3 py-1">
            <Zap size={12} />
            Plataforma SaaS colaborativa — v1.0
          </div>

          <h1 className="font-display text-5xl sm:text-6xl font-bold leading-tight mb-6">
            Trabajo en equipo{' '}
            <span className="text-gradient">reinventado</span>
          </h1>

          <p className="text-surface-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Gestiona tareas, proyectos, reuniones y notas en una sola plataforma.
            Colabora en tiempo real con tu equipo.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/login" className="btn-primary btn-lg">
              Empezar ahora
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary btn-lg">
              Ver demo
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl font-bold mb-3">Todo lo que tu equipo necesita</h2>
            <p className="text-surface-400">Una plataforma. Todas las herramientas.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="card p-5 hover:border-brand-500/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-brand-400" />
                </div>
                <h3 className="font-semibold text-surface-100 mb-2 text-sm">{f.title}</h3>
                <p className="text-surface-500 text-xs leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-800 py-8 px-6 text-center">
        <p className="text-surface-600 text-sm">
          © 2025 SaaS Platform · Construido con Node.js, React y PostgreSQL
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
