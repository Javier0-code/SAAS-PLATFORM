const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Project', {
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
  owner_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'SET NULL'
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
    validate: { notEmpty: true, len: [2, 150] }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(7),
    defaultValue: '#6172f3'
  },
  icon: {
    type: DataTypes.STRING(10),
    defaultValue: '📁'
  },
  status: {
    type: DataTypes.ENUM('active', 'archived', 'completed'),
    defaultValue: 'active'
  },
  // Tags como array de strings
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  // Usuarios que marcaron como favorito
  favorited_by: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  },
  // Fecha de inicio y fin estimada
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  due_date: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  // Orden dentro del workspace
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      default_view: 'kanban', // kanban | list | board
      allow_member_tasks: true
    }
  }
}, {
  tableName: 'projects',
  indexes: [
    { fields: ['workspace_id'] },
    { fields: ['owner_id'] },
    { fields: ['status'] },
    { fields: ['workspace_id', 'status'] }
  ]
});

module.exports = Project;
