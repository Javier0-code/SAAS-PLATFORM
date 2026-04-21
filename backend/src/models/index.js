/**
 * Models Index - Carga todos los modelos y define las asociaciones
 * A medida que avancen las etapas, se agregarán más modelos aquí
 */

const User = require('./User');
// ETAPA 3: const Workspace = require('./Workspace');
// ETAPA 4: const Project = require('./Project');
// ETAPA 5: const Task = require('./Task');
// ETAPA 6: const Comment = require('./Comment');
// ETAPA 7: const Meeting = require('./Meeting');
// ETAPA 8: const Note = require('./Note');
// ETAPA 9: const Notification = require('./Notification');
// ETAPA 11: const ActivityLog = require('./ActivityLog');

// ========================
// ASOCIACIONES (ETAPA 1)
// ========================
// Se agregarán asociaciones en las siguientes etapas

const db = {
  User
  // Workspace, Project, Task, Comment, Meeting, Note, Notification, ActivityLog
};

module.exports = db;
