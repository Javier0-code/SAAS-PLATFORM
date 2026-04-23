const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const InviteToken = sequelize.define('InviteToken', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  token: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true
  },
  workspace_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'workspaces', key: 'id' },
    onDelete: 'CASCADE'
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('admin', 'member'),
    defaultValue: 'member'
  },
  // Límite de usos (null = ilimitado)
  max_uses: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null
  },
  uses_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  // Expiración (null = no expira)
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Email específico al que va la invitación (opcional)
  email: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'invite_tokens',
  indexes: [
    { fields: ['token'] },
    { fields: ['workspace_id'] }
  ]
});

module.exports = InviteToken;
