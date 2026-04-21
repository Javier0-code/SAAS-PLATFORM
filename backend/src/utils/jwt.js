const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET         = process.env.JWT_SECRET         || 'dev_secret_CHANGE_ME';
const JWT_EXPIRES_IN     = process.env.JWT_EXPIRES_IN      || '7d';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET  || 'dev_refresh_secret_CHANGE_ME';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

/**
 * Genera un Access Token (vida corta)
 */
const generateAccessToken = (payload) => {
  return jwt.sign(
    {
      id:            payload.id,
      email:         payload.email,
      auth_provider: payload.auth_provider
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, issuer: 'saas-platform' }
  );
};

/**
 * Genera un Refresh Token (vida larga)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(
    { id: payload.id },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN, issuer: 'saas-platform' }
  );
};

/**
 * Verifica un Access Token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET, { issuer: 'saas-platform' });
  } catch (error) {
    logger.debug(`Access token verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Verifica un Refresh Token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, { issuer: 'saas-platform' });
  } catch (error) {
    logger.debug(`Refresh token verification failed: ${error.message}`);
    throw error;
  }
};

/**
 * Genera ambos tokens para un usuario
 */
const generateTokenPair = (user) => {
  const accessToken  = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  return { accessToken, refreshToken };
};

/**
 * Extrae el payload de un token sin verificar (para debugging)
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokenPair,
  decodeToken
};
