const { Workspace, WorkspaceMember } = require('../models');
const { sendNotFound, sendForbidden, sendUnauthorized } = require('../utils/response');

/**
 * Verifica que el workspace existe y que el usuario autenticado es miembro.
 * Adjunta req.workspace y req.membership (con el rol).
 */
const requireWorkspaceMember = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    if (!workspaceId) return sendNotFound(res, 'Workspace ID not provided');

    const workspace = await Workspace.findOne({
      where: { id: workspaceId, is_active: true }
    });
    if (!workspace) return sendNotFound(res, 'Workspace not found');

    const membership = await WorkspaceMember.findOne({
      where: { workspace_id: workspaceId, user_id: req.user.id, is_active: true }
    });
    if (!membership) return sendForbidden(res, 'You are not a member of this workspace');

    req.workspace   = workspace;
    req.membership  = membership;
    req.memberRole  = membership.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verifica que el usuario es admin del workspace.
 * Debe usarse después de requireWorkspaceMember.
 */
const requireWorkspaceAdmin = (req, res, next) => {
  if (req.memberRole !== 'admin') {
    return sendForbidden(res, 'Only workspace admins can perform this action');
  }
  next();
};

module.exports = { requireWorkspaceMember, requireWorkspaceAdmin };
