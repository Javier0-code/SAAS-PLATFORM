require('dotenv').config();
const { sequelize } = require('./database');
const db = require('../models');
const logger = require('../utils/logger');

const migrate = async () => {
  try {
    logger.info('🔄 Starting database migration...');

    // sync({ force: true }) en desarrollo para recrear tablas
    // sync({ alter: true }) para actualizaciones no destructivas
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === 'development',
      force: false 
    });

    logger.info('✅ Database migration completed successfully');
    logger.info('📋 Tables synchronized:');
    
    const tables = await sequelize.getQueryInterface().showAllTables();
    tables.forEach(table => logger.info(`   - ${table}`));

    process.exit(0);
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();
