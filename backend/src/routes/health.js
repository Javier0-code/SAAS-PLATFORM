const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/database');
const { sendSuccess } = require('../utils/response');

/**
 * GET /api/health
 * Health check endpoint - verifica estado del servidor y DB
 */
router.get('/', async (req, res) => {
  const startTime = Date.now();
  
  let dbStatus = 'connected';
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await sequelize.authenticate();
    dbLatency = Date.now() - dbStart;
  } catch (error) {
    dbStatus = 'disconnected';
  }

  const healthData = {
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    responseTime: `${Date.now() - startTime}ms`,
    services: {
      database: {
        status: dbStatus,
        latency: `${dbLatency}ms`
      },
      server: {
        status: 'running',
        memory: {
          used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
        }
      }
    }
  };

  return sendSuccess(res, healthData, 'Server is healthy');
});

/**
 * GET /api/health/ping
 * Simple ping endpoint
 */
router.get('/ping', (req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

module.exports = router;
