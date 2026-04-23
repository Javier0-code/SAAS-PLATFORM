const express = require('express');
const router  = express.Router();

const healthRoutes    = require('./health');
const authRoutes      = require('./auth');
const workspaceRoutes = require('./workspaces');
const projectRoutes   = require('./projects');
// const taskRoutes    = require('./tasks');     // ETAPA 5
// const commentRoutes = require('./comments'); // ETAPA 6
// const meetingRoutes = require('./meetings'); // ETAPA 7
// const noteRoutes    = require('./notes');    // ETAPA 8
// const notifRoutes   = require('./notifications'); // ETAPA 9

router.use('/health',     healthRoutes);
router.use('/auth',       authRoutes);
router.use('/workspaces', workspaceRoutes);
router.use('/projects',   projectRoutes);

module.exports = router;
