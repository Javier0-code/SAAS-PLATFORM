const { Op, fn, col, literal } = require('sequelize');
const { Project, Workspace, WorkspaceMember, User } = require('../models');
const {
  sendSuccess, sendCreated, sendError,
  sendNotFound, sendBadRequest, sendForbidden
} = require('../utils/response');
const logger = require('../utils/logger');

// ── Format helper ─────────────────────────────────────────
const fmt = (project, userId) => ({
  id:           project.id,
  workspace_id: project.workspace_id,
  name:         project.name,
  description:  project.description,
  color:        project.color,
  icon:         project.icon,
  status:       project.status,
  tags:         project.tags ?? [],
  is_favorite:  (project.favorited_by ?? []).includes(userId),
  start_date:   project.start_date,
  due_date:     project.due_date,
  sort_order:   project.sort_order,
  settings:     project.settings,
  owner:        project.owner ? {
    id: project.owner.id, name: project.owner.name, avatar_url: project.owner.avatar_url
  } : null,
  task_count:   project.dataValues.task_count ?? 0,
  created_at:   project.created_at,
  updated_at:   project.updated_at
});

// ── Verify workspace membership ───────────────────────────
const getMembership = async (workspaceId, userId) => {
  return WorkspaceMember.findOne({
    where: { workspace_id: workspaceId, user_id: userId, is_active: true }
  });
};

// ── Controllers ───────────────────────────────────────────

/**
 * GET /api/projects?workspaceId=&status=&tag=&ownerId=&favorites=
 * Lista proyectos del workspace con filtros
 */
const getProjects = async (req, res) => {
  try {
    const { workspaceId, status, tag, ownerId, favorites } = req.query;

    if (!workspaceId) return sendBadRequest(res, 'workspaceId is required');

    const membership = await getMembership(workspaceId, req.user.id);
    if (!membership) return sendForbidden(res, 'Not a member of this workspace');

    const where = { workspace_id: workspaceId };

    if (status)  where.status   = status;
    if (ownerId) where.owner_id = ownerId;
    if (tag)     where.tags     = { [Op.contains]: [tag] };

    // Filtrar favoritos del usuario
    if (favorites === 'true') {
      where.favorited_by = { [Op.contains]: [req.user.id] };
    }

    const projects = await Project.findAll({
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'avatar_url'] }],
      order: [
        ['sort_order', 'ASC'],
        ['created_at', 'DESC']
      ]
    });

    return sendSuccess(res, {
      projects: projects.map(p => fmt(p, req.user.id)),
      total:    projects.length
    });
  } catch (error) {
    logger.error('getProjects error:', error);
    return sendError(res, 'Failed to fetch projects');
  }
};

/**
 * GET /api/projects/all
 * Todos los proyectos del usuario en todos sus workspaces
 */
const getAllMyProjects = async (req, res) => {
  try {
    const memberships = await WorkspaceMember.findAll({
      where: { user_id: req.user.id, is_active: true },
      attributes: ['workspace_id']
    });

    const workspaceIds = memberships.map(m => m.workspace_id);
    if (!workspaceIds.length) return sendSuccess(res, { projects: [], total: 0 });

    const { status, tag } = req.query;
    const where = { workspace_id: { [Op.in]: workspaceIds } };
    if (status) where.status = status;
    if (tag)    where.tags   = { [Op.contains]: [tag] };

    const projects = await Project.findAll({
      where,
      include: [
        { model: User,      as: 'owner',     attributes: ['id', 'name', 'avatar_url'] },
        { model: Workspace, as: 'workspace', attributes: ['id', 'name', 'color'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return sendSuccess(res, {
      projects: projects.map(p => fmt(p, req.user.id)),
      total:    projects.length
    });
  } catch (error) {
    logger.error('getAllMyProjects error:', error);
    return sendError(res, 'Failed to fetch projects');
  }
};

/**
 * GET /api/projects/:id
 */
const getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User,      as: 'owner',     attributes: ['id', 'name', 'avatar_url', 'email'] },
        { model: Workspace, as: 'workspace', attributes: ['id', 'name', 'color'] }
      ]
    });

    if (!project) return sendNotFound(res, 'Project not found');

    const membership = await getMembership(project.workspace_id, req.user.id);
    if (!membership) return sendForbidden(res, 'Access denied');

    return sendSuccess(res, fmt(project, req.user.id));
  } catch (error) {
    return sendError(res, 'Failed to fetch project');
  }
};

/**
 * POST /api/projects
 */
const createProject = async (req, res) => {
  try {
    const { workspace_id, name, description, color, icon, tags, start_date, due_date } = req.body;

    if (!workspace_id) return sendBadRequest(res, 'workspace_id is required');
    if (!name?.trim()) return sendBadRequest(res, 'Project name is required');

    const membership = await getMembership(workspace_id, req.user.id);
    if (!membership) return sendForbidden(res, 'Not a member of this workspace');

    // Calcular sort_order (al final)
    const count = await Project.count({ where: { workspace_id } });

    const project = await Project.create({
      workspace_id,
      owner_id:    req.user.id,
      name:        name.trim(),
      description: description?.trim() || null,
      color:       color    || '#6172f3',
      icon:        icon     || '📁',
      tags:        tags     || [],
      start_date:  start_date || null,
      due_date:    due_date   || null,
      sort_order:  count
    });

    await project.reload({ include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'avatar_url'] }] });

    logger.info(`Project created: "${project.name}" in workspace ${workspace_id}`);
    return sendCreated(res, fmt(project, req.user.id), 'Project created successfully');
  } catch (error) {
    logger.error('createProject error:', error);
    return sendError(res, 'Failed to create project');
  }
};

/**
 * PATCH /api/projects/:id
 */
const updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return sendNotFound(res, 'Project not found');

    const membership = await getMembership(project.workspace_id, req.user.id);
    if (!membership) return sendForbidden(res, 'Access denied');

    // Solo admin o owner pueden editar
    if (membership.role !== 'admin' && project.owner_id !== req.user.id) {
      return sendForbidden(res, 'Only project owner or workspace admin can edit this project');
    }

    const { name, description, color, icon, status, tags, start_date, due_date, settings } = req.body;
    const updates = {};

    if (name        !== undefined) updates.name        = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (color       !== undefined) updates.color       = color;
    if (icon        !== undefined) updates.icon        = icon;
    if (status      !== undefined) updates.status      = status;
    if (tags        !== undefined) updates.tags        = tags;
    if (start_date  !== undefined) updates.start_date  = start_date;
    if (due_date    !== undefined) updates.due_date    = due_date;
    if (settings    !== undefined) updates.settings    = { ...project.settings, ...settings };

    await project.update(updates);
    await project.reload({ include: [{ model: User, as: 'owner', attributes: ['id', 'name', 'avatar_url'] }] });

    return sendSuccess(res, fmt(project, req.user.id), 'Project updated');
  } catch (error) {
    logger.error('updateProject error:', error);
    return sendError(res, 'Failed to update project');
  }
};

/**
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return sendNotFound(res, 'Project not found');

    const membership = await getMembership(project.workspace_id, req.user.id);
    if (!membership) return sendForbidden(res, 'Access denied');

    if (membership.role !== 'admin' && project.owner_id !== req.user.id) {
      return sendForbidden(res, 'Only project owner or workspace admin can delete this project');
    }

    await project.destroy();
    return sendSuccess(res, null, 'Project deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete project');
  }
};

/**
 * POST /api/projects/:id/favorite
 * Toggle favorito
 */
const toggleFavorite = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return sendNotFound(res, 'Project not found');

    const membership = await getMembership(project.workspace_id, req.user.id);
    if (!membership) return sendForbidden(res, 'Access denied');

    const favs        = project.favorited_by ?? [];
    const isFav       = favs.includes(req.user.id);
    const updatedFavs = isFav
      ? favs.filter(id => id !== req.user.id)
      : [...favs, req.user.id];

    await project.update({ favorited_by: updatedFavs });

    return sendSuccess(res, { is_favorite: !isFav },
      isFav ? 'Removed from favorites' : 'Added to favorites');
  } catch (error) {
    return sendError(res, 'Failed to toggle favorite');
  }
};

/**
 * PATCH /api/projects/reorder
 * Reordenar proyectos (drag & drop)
 */
const reorderProjects = async (req, res) => {
  try {
    const { workspace_id, order } = req.body; // order: [{ id, sort_order }]
    if (!workspace_id || !Array.isArray(order)) return sendBadRequest(res, 'Invalid payload');

    const membership = await getMembership(workspace_id, req.user.id);
    if (!membership) return sendForbidden(res, 'Access denied');

    await Promise.all(
      order.map(({ id, sort_order }) =>
        Project.update({ sort_order }, { where: { id, workspace_id } })
      )
    );

    return sendSuccess(res, null, 'Projects reordered');
  } catch (error) {
    return sendError(res, 'Failed to reorder projects');
  }
};

/**
 * GET /api/projects/tags?workspaceId=
 * Obtener todos los tags únicos del workspace
 */
const getTags = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) return sendBadRequest(res, 'workspaceId is required');

    const membership = await getMembership(workspaceId, req.user.id);
    if (!membership) return sendForbidden(res, 'Access denied');

    const projects = await Project.findAll({
      where: { workspace_id: workspaceId },
      attributes: ['tags']
    });

    const allTags = [...new Set(projects.flatMap(p => p.tags ?? []))].sort();
    return sendSuccess(res, { tags: allTags });
  } catch (error) {
    return sendError(res, 'Failed to fetch tags');
  }
};

module.exports = {
  getProjects, getAllMyProjects, getProject,
  createProject, updateProject, deleteProject,
  toggleFavorite, reorderProjects, getTags
};
