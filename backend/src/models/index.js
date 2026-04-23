const User            = require('./User');
const Workspace       = require('./Workspace');
const WorkspaceMember = require('./WorkspaceMember');
const InviteToken     = require('./InviteToken');
const Project         = require('./Project');
// ETAPA 5: const Task    = require('./Task');
// ETAPA 6: const Comment = require('./Comment');
// ETAPA 7: const Meeting = require('./Meeting');
// ETAPA 8: const Note    = require('./Note');
// ETAPA 9: const Notification = require('./Notification');
// ETAPA 11: const ActivityLog = require('./ActivityLog');

// ── Workspace associations ────────────────────────────────
User.hasMany(Workspace, { foreignKey: 'owner_id', as: 'ownedWorkspaces' });
Workspace.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

Workspace.belongsToMany(User, { through: WorkspaceMember, foreignKey: 'workspace_id', otherKey: 'user_id', as: 'members' });
User.belongsToMany(Workspace, { through: WorkspaceMember, foreignKey: 'user_id', otherKey: 'workspace_id', as: 'workspaces' });

Workspace.hasMany(WorkspaceMember, { foreignKey: 'workspace_id', as: 'memberships' });
WorkspaceMember.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });
WorkspaceMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WorkspaceMember.belongsTo(User, { foreignKey: 'invited_by', as: 'inviter' });

Workspace.hasMany(InviteToken, { foreignKey: 'workspace_id', as: 'inviteTokens' });
InviteToken.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });
InviteToken.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// ── Project associations ──────────────────────────────────
Workspace.hasMany(Project, { foreignKey: 'workspace_id', as: 'projects' });
Project.belongsTo(Workspace, { foreignKey: 'workspace_id', as: 'workspace' });
Project.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
User.hasMany(Project, { foreignKey: 'owner_id', as: 'ownedProjects' });

const db = { User, Workspace, WorkspaceMember, InviteToken, Project };
module.exports = db;
