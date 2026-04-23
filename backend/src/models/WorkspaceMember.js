const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const WorkspaceMember = sequelize.define('WorkspaceMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  workspace_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'workspaces', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member',
    allowNull: false
  },
  // Fecha en la que se unió
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  // Quién lo invitó
  invited_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'SET NULL'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'workspace_members',
  indexes: [
    { unique: true, fields: ['workspace_id', 'user_id'] },
    { fields: ['user_id'] },
    { fields: ['workspace_id'] }
  ]
});

module.exports = WorkspaceMember;
