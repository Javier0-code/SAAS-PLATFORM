const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { generateTokenPair, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess, sendCreated, sendError, sendUnauthorized, sendBadRequest, sendValidationError } = require('../utils/response');
const logger = require('../utils/logger');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ================================
// HELPERS
// ================================

/**
 * Construye el objeto de respuesta de usuario (sin datos sensibles)
 */
const formatUserResponse = (user) => ({
  id:               user.id,
  name:             user.name,
  email:            user.email,
  avatar_url:       user.avatar_url,
  auth_provider:    user.auth_provider,
  is_email_verified: user.is_email_verified,
  timezone:         user.timezone,
  locale:           user.locale,
  preferences:      user.preferences,
  created_at:       user.created_at,
  last_login_at:    user.last_login_at
});

/**
 * Setea cookies seguras con los tokens
 */
const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProd = process.env.NODE_ENV === 'production';

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000 // 7 días
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge:   30 * 24 * 60 * 60 * 1000 // 30 días
  });
};

// ================================
// OAUTH CALLBACK HANDLER
// ================================

/**
 * Handler genérico para callbacks de OAuth (Google y Apple)
 * Redirige al frontend con los tokens
 */
const handleOAuthCallback = async (req, res) => {
  try {
    if (!req.user) {
      logger.warn('OAuth callback called without user in request');
      return res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }

    const { accessToken, refreshToken } = generateTokenPair(req.user);

    // Actualizar último login
    await req.user.update({ last_login_at: new Date() });

    // Opción 1: Setear cookies httpOnly (más seguro)
    setTokenCookies(res, accessToken, refreshToken);

    // Opción 2: Redirigir con tokens en query params (para SPAs)
    // El frontend los captura y los guarda en localStorage
    const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set('access_token', accessToken);
    redirectUrl.searchParams.set('refresh_token', refreshToken);

    logger.info(`OAuth login successful: ${req.user.email} (${req.user.auth_provider})`);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    logger.error('OAuth callback error:', error);
    return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
  }
};

// ================================
// EMAIL / PASSWORD AUTH
// ================================

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return sendValidationError(res, [
        !name     && { field: 'name',     message: 'Name is required' },
        !email    && { field: 'email',    message: 'Email is required' },
        !password && { field: 'password', message: 'Password is required' }
      ].filter(Boolean));
    }

    if (password.length < 8) {
      return sendValidationError(res, [{ field: 'password', message: 'Password must be at least 8 characters' }]);
    }

    // Verificar si el email ya existe
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return sendError(res, 'Email already registered', 409);
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const user = await User.create({
      name:          name.trim(),
      email:         email.toLowerCase().trim(),
      password_hash,
      auth_provider: 'email',
      is_active:     true,
      last_login_at: new Date()
    });

    const { accessToken, refreshToken } = generateTokenPair(user);
    setTokenCookies(res, accessToken, refreshToken);

    logger.info(`New user registered: ${user.email}`);

    return sendCreated(res, {
      user:         formatUserResponse(user),
      accessToken,
      refreshToken
    }, 'Account created successfully');

  } catch (error) {
    logger.error('Register error:', error);
    return sendError(res, 'Registration failed');
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendBadRequest(res, 'Email and password are required');
    }

    // Buscar usuario
    const user = await User.findOne({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    if (!user.is_active) {
      return sendUnauthorized(res, 'Account is deactivated');
    }

    if (!user.password_hash) {
      return sendUnauthorized(res, `This account uses ${user.auth_provider} login. Please sign in with ${user.auth_provider}.`);
    }

    // Verificar contraseña
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return sendUnauthorized(res, 'Invalid credentials');
    }

    // Actualizar último login
    await user.update({ last_login_at: new Date() });

    const { accessToken, refreshToken } = generateTokenPair(user);
    setTokenCookies(res, accessToken, refreshToken);

    logger.info(`User logged in: ${user.email}`);

    return sendSuccess(res, {
      user:         formatUserResponse(user),
      accessToken,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    logger.error('Login error:', error);
    return sendError(res, 'Login failed');
  }
};

// ================================
// TOKEN MANAGEMENT
// ================================

/**
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const token = req.body.refreshToken || req.cookies?.refresh_token;

    if (!token) {
      return sendUnauthorized(res, 'Refresh token not provided');
    }

    const decoded = verifyRefreshToken(token);

    const user = await User.findOne({
      where: { id: decoded.id, is_active: true },
      attributes: { exclude: ['password_hash', 'email_verification_token', 'password_reset_token'] }
    });

    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user);
    setTokenCookies(res, accessToken, newRefreshToken);

    return sendSuccess(res, {
      accessToken,
      refreshToken: newRefreshToken
    }, 'Tokens refreshed successfully');

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Refresh token expired, please log in again');
    }
    return sendUnauthorized(res, 'Invalid refresh token');
  }
};

/**
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  try {
    // Limpiar cookies
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    return sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    return sendError(res, 'Logout failed');
  }
};

// ================================
// PROFILE
// ================================

/**
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    return sendSuccess(res, {
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    return sendError(res, 'Failed to get user profile');
  }
};

/**
 * PATCH /api/auth/me
 */
const updateMe = async (req, res) => {
  try {
    const { name, timezone, locale, preferences } = req.body;
    const updates = {};

    if (name)        updates.name = name.trim();
    if (timezone)    updates.timezone = timezone;
    if (locale)      updates.locale = locale;
    if (preferences) updates.preferences = { ...req.user.preferences, ...preferences };

    await req.user.update(updates);
    await req.user.reload();

    return sendSuccess(res, {
      user: formatUserResponse(req.user)
    }, 'Profile updated successfully');
  } catch (error) {
    logger.error('Update profile error:', error);
    return sendError(res, 'Failed to update profile');
  }
};

/**
 * POST /api/auth/change-password
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendBadRequest(res, 'Current and new password are required');
    }

    if (newPassword.length < 8) {
      return sendBadRequest(res, 'New password must be at least 8 characters');
    }

    if (!req.user.password_hash) {
      return sendBadRequest(res, 'Cannot change password for OAuth accounts');
    }

    const isValid = await bcrypt.compare(currentPassword, req.user.password_hash);
    if (!isValid) {
      return sendUnauthorized(res, 'Current password is incorrect');
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await req.user.update({ password_hash });

    return sendSuccess(res, null, 'Password changed successfully');
  } catch (error) {
    logger.error('Change password error:', error);
    return sendError(res, 'Failed to change password');
  }
};

module.exports = {
  handleOAuthCallback,
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  changePassword
};
