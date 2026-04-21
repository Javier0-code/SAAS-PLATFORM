const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true // Null for OAuth users
  },
  avatar_url: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // OAuth providers
  google_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  apple_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  // Auth provider tracking
  auth_provider: {
    type: DataTypes.ENUM('email', 'google', 'apple'),
    defaultValue: 'email'
  },
  // Account status
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verification_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  // Password reset
  password_reset_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  password_reset_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Profile
  timezone: {
    type: DataTypes.STRING(50),
    defaultValue: 'UTC'
  },
  locale: {
    type: DataTypes.STRING(10),
    defaultValue: 'en'
  },
  // Metadata
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_seen_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Preferences JSON
  preferences: {
    type: DataTypes.JSONB,
    defaultValue: {
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        desktop: true
      },
      sidebar_collapsed: false
    }
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'] },
    { fields: ['google_id'] },
    { fields: ['apple_id'] }
  ]
});

module.exports = User;
