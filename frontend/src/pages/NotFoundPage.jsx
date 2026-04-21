import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => (
  <div className="min-h-screen bg-surface-950 flex items-center justify-center px-4">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <p className="font-display text-9xl font-bold text-surface-800 select-none">404</p>
      <h1 className="font-display text-2xl font-bold text-surface-200 mt-4 mb-2">Página no encontrada</h1>
      <p className="text-surface-500 text-sm mb-8">La ruta que buscas no existe.</p>
      <div className="flex items-center justify-center gap-3">
        <Link to="/" className="btn-primary gap-2">
          <Home size={16} /> Ir al inicio
        </Link>
        <button onClick={() => window.history.back()} className="btn-secondary gap-2">
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    </motion.div>
  </div>
);

export default NotFoundPage;
