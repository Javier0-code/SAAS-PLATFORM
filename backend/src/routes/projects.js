const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getProjects, getAllMyProjects, getProject,
  createProject, updateProject, deleteProject,
  toggleFavorite, reorderProjects, getTags
} = require('../controllers/projectController');

router.use(authenticate);

// Rutas especiales — antes de /:id para evitar conflictos
router.get('/all',      getAllMyProjects);
router.get('/tags',     getTags);
router.patch('/reorder', reorderProjects);

// CRUD
router.get( '/',    getProjects);
router.post('/',    createProject);

router.get(   '/:id', getProject);
router.patch( '/:id', updateProject);
router.delete('/:id', deleteProject);

// Favorito
router.post('/:id/favorite', toggleFavorite);

module.exports = router;
