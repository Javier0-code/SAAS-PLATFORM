const crypto = require('crypto');
const { Op }  = require('sequelize');
const { Workspace, WorkspaceMember, InviteToken, User } = require('../models');
const {
  sendSuccess, sendCreated, sendError,
  sendNotFound, sendBadRequest, sendForbidden
} = require('../utils/response');
const logger = require('../utils/logger');

// ── Helpers ──────────────────────────────────────────────

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 60);
};

const generateUniqueSlug = async (name) => {
  const base = generateSlug(name);
  let slug = base;
  let i = 1;
  while (await Workspace.findOne({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
};

const generateInviteToken = () => crypto.randomBytes(32).toString('hex');

const workspaceResponse = (workspace, membership = null) => ({
  id:          workspace.id,
  name:        workspace.name,
  description: workspace.description,
  slug:        workspace.slug,
  logo_url:    workspace.logo_url,
  color:       workspace.color,
  settings:    workspace.settings,
  owner:       workspace.owner ? {
    id: workspace.owner.id, name: workspace.owner.name, avatar_url: workspace.owner.avatar_url
  } : undefined,
  members_count: workspace.memberships?.length ?? workspace.members?.length ?? undefined,
  role:        membership?.role ?? undefined,
  joined_at:   membership?.joined_at ?? undefined,
  created_at:  workspace.created_at
});

// ── Controllers ──────────────────────────────────────────

/**
 * POST /api/workspaces
 * Crear workspace
 */
const createWorkspace = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    if (!name?.trim()) return sendBadRequest(res, 'Workspace name is required');

    const slug = await generateUniqueSlug(name);

    const workspace = await Workspace.create({
      name: name.trim(),
      description: description?.trim() || null,
      slug,
      color: color || '#6172f3',
      owner_id: req.user.id
    });

    // El creador es automáticamente admin
    await WorkspaceMember.create({
      workspace_id: workspace.id,
      user_id:      req.user.id,
      role:         'admin',
      joined_at:    new Date()
    });

    logger.info(`Workspace created: ${workspace.name} by ${req.user.email}`);

    return sendCreated(res, workspaceResponse(workspace), 'Workspace created successfully');
  } catch (error) {
    logger.error('createWorkspace error:', error);
    return sendError(res, 'Failed to create workspace');
  }
};

/**
 * GET /api/workspaces
 * Listar workspaces del usuario autenticado
 */
const getMyWorkspaces = async (req, res) => {
  try {
    const memberships = await WorkspaceMember.findAll({
      where: { user_id: req.user.id, is_active: true },
      include: [{
        model: Workspace,
        as: 'workspace',
        where: { is_active: true },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'avatar_url', 'email'] },
          { model: WorkspaceMember, as: 'memberships', attributes: ['id'], where: { is_active: true }, required: false }
        ]
      }],
      order: [[{ model: Workspace, as: 'workspace' }, 'created_at', 'ASC']]
    });

    const workspaces = memberships.map(m => workspaceResponse(m.workspace, m));
    return sendSuccess(res, { workspaces, total: workspaces.length });
  } catch (error) {
    logger.error('getMyWorkspaces error:', error);
    return sendError(res, 'Failed to fetch workspaces');
  }
};

/**
 * GET /api/workspaces/:workspaceId
 * Obtener workspace por ID (requiere ser miembro)
 */
const getWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      where: { id: req.params.workspaceId, is_active: true },
      include: [
        { model: User, as: 'owner', attributes: ['id', 'name', 'avatar_url', 'email'] },
        {
          model: WorkspaceMember,
          as: 'memberships',
          where: { is_active: true },
          required: false,
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar_url'] }]
        }
      ]
    });

    if (!workspace) return sendNotFound(res, 'Workspace not found');

    return sendSuccess(res, workspaceResponse(workspace, req.membership));
  } catch (error) {
    return sendError(res, 'Failed to fetch workspace');
  }
};

/**
 * PATCH /api/workspaces/:workspaceId
 * Actualizar workspace (solo admin)
 */
const updateWorkspace = async (req, res) => {
  try {
    const { name, description, color, settings } = req.body;
    const updates = {};

    if (name)        { updates.name = name.trim(); updates.slug = await generateUniqueSlug(name); }
    if (description !== undefined) updates.description = description?.trim() || null;
    if (color)       updates.color = color;
    if (settings)    updates.settings = { ...req.workspace.settings, ...settings };

    await req.workspace.update(updates);
    await req.workspace.reload();

    return sendSuccess(res, workspaceResponse(req.workspace, req.membership), 'Workspace updated');
  } catch (error) {
    logger.error('updateWorkspace error:', error);
    return sendError(res, 'Failed to update workspace');
  }
};

/**
 * DELETE /api/workspaces/:workspaceId
 * Eliminar workspace (solo owner)
 */
const deleteWorkspace = async (req, res) => {
  try {
    if (req.workspace.owner_id !== req.user.id) {
      return sendForbidden(res, 'Only the workspace owner can delete it');
    }
    await req.workspace.update({ is_active: false });
    logger.info(`Workspace deleted: ${req.workspace.name}`);
    return sendSuccess(res, null, 'Workspace deleted successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete workspace');
  }
};

// ── Members ──────────────────────────────────────────────

/**
 * GET /api/workspaces/:workspaceId/members
 */
const getMembers = async (req, res) => {
  try {
    const memberships = await WorkspaceMember.findAll({
      where: { workspace_id: req.params.workspaceId, is_active: true },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar_url', 'last_seen_at'] },
        { model: User, as: 'inviter', attributes: ['id', 'name'], required: false }
      ],
      order: [['joined_at', 'ASC']]
    });

    const members = memberships.map(m => ({
      id:         m.id,
      user:       m.user,
      role:       m.role,
      joined_at:  m.joined_at,
      invited_by: m.inviter
    }));

    return sendSuccess(res, { members, total: members.length });
  } catch (error) {
    return sendError(res, 'Failed to fetch members');
  }
};

/**
 * PATCH /api/workspaces/:workspaceId/members/:userId
 * Cambiar rol de un miembro (solo admin)
 */
const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'member'].includes(role)) return sendBadRequest(res, 'Invalid role');

    const membership = await WorkspaceMember.findOne({
      where: { workspace_id: req.params.workspaceId, user_id: req.params.userId, is_active: true }
    });
    if (!membership) return sendNotFound(res, 'Member not found');

    // No degradar al owner
    if (req.workspace.owner_id === req.params.userId && role !== 'admin') {
      return sendForbidden(res, 'Cannot change the role of the workspace owner');
    }

    await membership.update({ role });
    return sendSuccess(res, { role }, 'Member role updated');
  } catch (error) {
    return sendError(res, 'Failed to update member role');
  }
};

/**
 * DELETE /api/workspaces/:workspaceId/members/:userId
 * Remover miembro (admin o el propio usuario)
 */
const removeMember = async (req, res) => {
  try {
    const isSelf  = req.params.userId === req.user.id;
    const isAdmin = req.memberRole === 'admin';
    if (!isSelf && !isAdmin) return sendForbidden(res, 'Not allowed');

    if (req.workspace.owner_id === req.params.userId) {
      return sendForbidden(res, 'Cannot remove the workspace owner');
    }

    await WorkspaceMember.update(
      { is_active: false },
      { where: { workspace_id: req.params.workspaceId, user_id: req.params.userId } }
    );
    return sendSuccess(res, null, isSelf ? 'Left workspace' : 'Member removed');
  } catch (error) {
    return sendError(res, 'Failed to remove member');
  }
};

// ── Invite Tokens ─────────────────────────────────────────

/**
 * POST /api/workspaces/:workspaceId/invites
 * Generar token de invitación (solo admin)
 */
const createInviteToken = async (req, res) => {
  try {
    const { role = 'member', max_uses = null, expires_in_days = 7, email = null } = req.body;

    const token      = generateInviteToken();
    const expires_at = expires_in_days
      ? new Date(Date.now() + expires_in_days * 24 * 60 * 60 * 1000)
      : null;

    const invite = await InviteToken.create({
      token,
      workspace_id: req.params.workspaceId,
      created_by:   req.user.id,
      role,
      max_uses:     max_uses ? parseInt(max_uses) : null,
      expires_at,
      email: email?.toLowerCase() || null
    });

    const inviteUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join/${token}`;

    return sendCreated(res, {
      id:          invite.id,
      token:       invite.token,
      invite_url:  inviteUrl,
      role:        invite.role,
      max_uses:    invite.max_uses,
      expires_at:  invite.expires_at,
      email:       invite.email
    }, 'Invite token created');
  } catch (error) {
    logger.error('createInviteToken error:', error);
    return sendError(res, 'Failed to create invite token');
  }
};

/**
 * GET /api/workspaces/:workspaceId/invites
 * Listar tokens activos (solo admin)
 */
const getInviteTokens = async (req, res) => {
  try {
    const invites = await InviteToken.findAll({
      where: { workspace_id: req.params.workspaceId, is_active: true },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'avatar_url'] }],
      order: [['created_at', 'DESC']]
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    return sendSuccess(res, {
      invites: invites.map(inv => ({
        id:         inv.id,
        token:      inv.token,
        invite_url: `${frontendUrl}/join/${inv.token}`,
        role:       inv.role,
        max_uses:   inv.max_uses,
        uses_count: inv.uses_count,
        expires_at: inv.expires_at,
        email:      inv.email,
        creator:    inv.creator,
        created_at: inv.created_at
      }))
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch invite tokens');
  }
};

/**
 * DELETE /api/workspaces/:workspaceId/invites/:inviteId
 * Revocar token (solo admin)
 */
const revokeInviteToken = async (req, res) => {
  try {
    const invite = await InviteToken.findOne({
      where: { id: req.params.inviteId, workspace_id: req.params.workspaceId }
    });
    if (!invite) return sendNotFound(res, 'Invite token not found');
    await invite.update({ is_active: false });
    return sendSuccess(res, null, 'Invite token revoked');
  } catch (error) {
    return sendError(res, 'Failed to revoke token');
  }
};

// ── Join via token ────────────────────────────────────────

/**
 * GET /api/workspaces/join/:token
 * Preview del workspace antes de unirse
 */
const previewInvite = async (req, res) => {
  try {
    const invite = await InviteToken.findOne({
      where: { token: req.params.token, is_active: true },
      include: [{
        model: Workspace,
        as: 'workspace',
        where: { is_active: true },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'name', 'avatar_url'] },
          { model: WorkspaceMember, as: 'memberships', where: { is_active: true }, required: false, attributes: ['id'] }
        ]
      }]
    });

    if (!invite) return sendNotFound(res, 'Invite link is invalid or has been revoked');
    if (invite.expires_at && new Date() > invite.expires_at) {
      return sendBadRequest(res, 'This invite link has expired');
    }
    if (invite.max_uses && invite.uses_count >= invite.max_uses) {
      return sendBadRequest(res, 'This invite link has reached its maximum uses');
    }
    if (invite.email && invite.email !== req.user?.email) {
      return sendForbidden(res, 'This invite is for a specific email address');
    }

    return sendSuccess(res, {
      workspace: {
        id:           invite.workspace.id,
        name:         invite.workspace.name,
        description:  invite.workspace.description,
        color:        invite.workspace.color,
        logo_url:     invite.workspace.logo_url,
        owner:        invite.workspace.owner,
        members_count: invite.workspace.memberships?.length ?? 0
      },
      role:       invite.role,
      expires_at: invite.expires_at
    });
  } catch (error) {
    return sendError(res, 'Failed to preview invite');
  }
};

/**
 * POST /api/workspaces/join/:token
 * Unirse al workspace con token
 */
const joinWorkspace = async (req, res) => {
  try {
    const invite = await InviteToken.findOne({
      where: { token: req.params.token, is_active: true },
      include: [{ model: Workspace, as: 'workspace', where: { is_active: true } }]
    });

    if (!invite) return sendNotFound(res, 'Invite link is invalid or has been revoked');
    if (invite.expires_at && new Date() > invite.expires_at) {
      return sendBadRequest(res, 'This invite link has expired');
    }
    if (invite.max_uses && invite.uses_count >= invite.max_uses) {
      return sendBadRequest(res, 'This invite link has reached its maximum uses');
    }
    if (invite.email && invite.email !== req.user.email) {
      return sendForbidden(res, 'This invite is for a specific email address');
    }

    // Verificar si ya es miembro
    const existing = await WorkspaceMember.findOne({
      where: { workspace_id: invite.workspace_id, user_id: req.user.id }
    });

    if (existing) {
      if (existing.is_active) return sendBadRequest(res, 'You are already a member of this workspace');
      // Reactivar membresía
      await existing.update({ is_active: true, role: invite.role, joined_at: new Date() });
    } else {
      await WorkspaceMember.create({
        workspace_id: invite.workspace_id,
        user_id:      req.user.id,
        role:         invite.role,
        invited_by:   invite.created_by,
        joined_at:    new Date()
      });
    }

    // Incrementar contador de usos
    await invite.increment('uses_count');

    // Desactivar si llegó al máximo
    if (invite.max_uses && invite.uses_count + 1 >= invite.max_uses) {
      await invite.update({ is_active: false });
    }

    logger.info(`User ${req.user.email} joined workspace ${invite.workspace.name}`);

    return sendSuccess(res, {
      workspace_id: invite.workspace_id,
      workspace_name: invite.workspace.name,
      role: invite.role
    }, `You have joined ${invite.workspace.name}!`);
  } catch (error) {
    logger.error('joinWorkspace error:', error);
    return sendError(res, 'Failed to join workspace');
  }
};

module.exports = {
  createWorkspace, getMyWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace,
  getMembers, updateMemberRole, removeMember,
  createInviteToken, getInviteTokens, revokeInviteToken,
  previewInvite, joinWorkspace
};
