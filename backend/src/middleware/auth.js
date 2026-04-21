const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const { sendUnauthorized, sendForbidden } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Middleware principal de autenticación JWT
 * Verifica el token en el header Authorization o en cookies
 */
const authenticate = async (req, res, next) => {
  try {
    let token = null;

    // 1. Buscar en Authorization header (Bearer token)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // 2. Buscar en cookies (fallback)
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (!token) {
      return sendUnauthorized(res, 'No authentication token provided');
    }

    // Verificar y decodificar el token
    const decoded = verifyAccessToken(token);

    // Buscar el usuario en la base de datos
    const user = await User.findOne({
      where: { id: decoded.id, is_active: true },
      attributes: { exclude: ['password_hash', 'email_verification_token', 'password_reset_token'] }
    });

    if (!user) {
      return sendUnauthorized(res, 'User not found or account deactivated');
    }

    // Actualizar last_seen_at sin await para no bloquear la request
    User.update(
      { last_seen_at: new Date() },
      { where: { id: user.id } }
    ).catch(err => logger.debug('last_seen_at update failed:', err.message));

    // Adjuntar usuario al request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token expired, please refresh');
    }
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    }
    logger.error('Authentication middleware error:', error);
    return sendUnauthorized(res, 'Authentication failed');
  }
};

/**
 * Middleware opcional: adjunta usuario si hay token, pero no bloquea si no hay
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findOne({
        where: { id: decoded.id, is_active: true },
        attributes: { exclude: ['password_hash', 'email_verification_token', 'password_reset_token'] }
      });
      if (user) req.user = user;
    }
  } catch (_) {
    // Ignorar errores — es opcional
  }
  next();
};

/**
 * Middleware de autorización por rol dentro de un workspace
 * Se usará en Etapa 3 con workspaces
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return sendUnauthorized(res);

    // req.memberRole se setea en el middleware de workspace (Etapa 3)
    if (req.memberRole && !roles.includes(req.memberRole)) {
      return sendForbidden(res, `Role '${req.memberRole}' is not allowed. Required: ${roles.join(', ')}`);
    }

    next();
  };
};

module.exports = { authenticate, optionalAuthenticate, requireRole };
