const express = require('express');
const router = express.Router();

// Rutas disponibles en Etapa 1
const healthRoutes = require('./health');

const authRoutes = require('./auth');           // ETAPA 2 ✅
// Las siguientes se agregarán en las próximas etapas:
// const workspaceRoutes = require('./workspaces'); // ETAPA 3
// const projectRoutes = require('./projects'); // ETAPA 4
// const taskRoutes = require('./tasks');       // ETAPA 5
// const commentRoutes = require('./comments'); // ETAPA 6
// const meetingRoutes = require('./meetings'); // ETAPA 7
// const noteRoutes = require('./notes');       // ETAPA 8
// const notificationRoutes = require('./notifications'); // ETAPA 9

// Montar rutas
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);               // ETAPA 2 ✅
// router.use('/workspaces', workspaceRoutes); // ETAPA 3
// router.use('/projects', projectRoutes);     // ETAPA 4
// router.use('/tasks', taskRoutes);           // ETAPA 5
// router.use('/comments', commentRoutes);     // ETAPA 6
// router.use('/meetings', meetingRoutes);     // ETAPA 7
// router.use('/notes', noteRoutes);           // ETAPA 8
// router.use('/notifications', notificationRoutes); // ETAPA 9

module.exports = router;
