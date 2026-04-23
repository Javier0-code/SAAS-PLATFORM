const express = require('express');
const router  = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireWorkspaceMember, requireWorkspaceAdmin } = require('../middleware/workspace');
const {
  createWorkspace, getMyWorkspaces, getWorkspace, updateWorkspace, deleteWorkspace,
  getMembers, updateMemberRole, removeMember,
  createInviteToken, getInviteTokens, revokeInviteToken,
  previewInvite, joinWorkspace
} = require('../controllers/workspaceController');

// Todas las rutas requieren autenticación
router.use(authenticate);

// ── Join via token (sin requerir ser miembro) ─────────────
router.get( '/join/:token', previewInvite);
router.post('/join/:token', joinWorkspace);

// ── CRUD de workspaces ────────────────────────────────────
router.get( '/',    getMyWorkspaces);
router.post('/',    createWorkspace);

router.get(   '/:workspaceId', requireWorkspaceMember, getWorkspace);
router.patch( '/:workspaceId', requireWorkspaceMember, requireWorkspaceAdmin, updateWorkspace);
router.delete('/:workspaceId', requireWorkspaceMember, requireWorkspaceAdmin, deleteWorkspace);

// ── Miembros ──────────────────────────────────────────────
router.get(   '/:workspaceId/members',          requireWorkspaceMember, getMembers);
router.patch( '/:workspaceId/members/:userId',  requireWorkspaceMember, requireWorkspaceAdmin, updateMemberRole);
router.delete('/:workspaceId/members/:userId',  requireWorkspaceMember, removeMember);

// ── Invitaciones ──────────────────────────────────────────
router.get(   '/:workspaceId/invites',              requireWorkspaceMember, requireWorkspaceAdmin, getInviteTokens);
router.post(  '/:workspaceId/invites',              requireWorkspaceMember, requireWorkspaceAdmin, createInviteToken);
router.delete('/:workspaceId/invites/:inviteId',    requireWorkspaceMember, requireWorkspaceAdmin, revokeInviteToken);

module.exports = router;
