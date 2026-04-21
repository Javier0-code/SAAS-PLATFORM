const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const {
  handleOAuthCallback,
  register,
  login,
  refreshToken,
  logout,
  getMe,
  updateMe,
  changePassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limit estricto para rutas de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10,
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// ================================
// EMAIL / PASSWORD
// ================================
router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);

// ================================
// TOKEN MANAGEMENT
// ================================
router.post('/refresh', refreshToken);
router.post('/logout',  authenticate, logout);

// ================================
// PROFILE
// ================================
router.get('/me',    authenticate, getMe);
router.patch('/me',  authenticate, updateMe);
router.post('/change-password', authenticate, changePassword);

// ================================
// GOOGLE OAUTH 2.0
// ================================
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_failed`
  }),
  handleOAuthCallback
);

// ================================
// APPLE OAUTH
// ================================
router.get(
  '/apple',
  (req, res, next) => {
    // Verificar que Apple OAuth está configurado
    const appleStrategy = passport._strategies?.apple;
    if (!appleStrategy) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=apple_not_configured`
      );
    }
    passport.authenticate('apple', { session: false })(req, res, next);
  }
);

router.post(
  '/apple/callback',
  (req, res, next) => {
    const appleStrategy = passport._strategies?.apple;
    if (!appleStrategy) {
      return res.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=apple_not_configured`
      );
    }
    passport.authenticate('apple', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=apple_failed` })(req, res, next);
  },
  handleOAuthCallback
);

module.exports = router;
