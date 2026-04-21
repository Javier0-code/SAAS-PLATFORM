require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./config/database');
const { sequelize } = require('./config/database');
const db = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Función principal de arranque
const startServer = async () => {
  try {
    // 1. Verificar conexión a la base de datos
    await testConnection();

    // 2. Sincronizar modelos (solo en desarrollo con alter)
    if (NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('📋 Database models synchronized');
    }

    // 3. Iniciar el servidor HTTP
    const server = app.listen(PORT, () => {
      logger.info('═══════════════════════════════════════');
      logger.info(`🚀 SaaS Platform Backend running!`);
      logger.info(`📍 URL: http://localhost:${PORT}`);
      logger.info(`🌍 Environment: ${NODE_ENV}`);
      logger.info(`❤️  Health: http://localhost:${PORT}/api/health`);
      logger.info('═══════════════════════════════════════');
    });

    // 4. Manejo graceful de cierre
    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await sequelize.close();
          logger.info('Database connection closed');
        } catch (err) {
          logger.error('Error closing database:', err);
        }
        
        process.exit(0);
      });

      // Forzar cierre después de 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
