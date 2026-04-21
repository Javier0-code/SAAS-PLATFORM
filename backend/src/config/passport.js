const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const logger = require('../utils/logger');

// ================================
// GOOGLE OAUTH 2.0
// ================================
passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['profile', 'email'],
      passReqToCallback: false
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email      = profile.emails?.[0]?.value;
        const googleId   = profile.id;
        const name       = profile.displayName || profile.name?.givenName || 'Usuario';
        const avatarUrl  = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('No email provided by Google'), null);
        }

        // 1. Buscar por google_id
        let user = await User.findOne({ where: { google_id: googleId } });

        // 2. Si no existe por google_id, buscar por email
        if (!user) {
          user = await User.findOne({ where: { email } });

          if (user) {
            // Vincular cuenta de Google a usuario existente
            await user.update({
              google_id:      googleId,
              auth_provider:  'google',
              avatar_url:     user.avatar_url || avatarUrl,
              is_email_verified: true,
              last_login_at:  new Date()
            });
          } else {
            // Crear nuevo usuario
            user = await User.create({
              name,
              email,
              google_id:        googleId,
              auth_provider:    'google',
              avatar_url:       avatarUrl,
              is_email_verified: true,
              is_active:        true,
              last_login_at:    new Date()
            });
            logger.info(`New user created via Google OAuth: ${email}`);
          }
        } else {
          // Actualizar último login
          await user.update({ last_login_at: new Date() });
        }

        return done(null, user);
      } catch (error) {
        logger.error('Google OAuth error:', error);
        return done(error, null);
      }
    }
  )
);

// ================================
// APPLE OAUTH
// Nota: requiere cuenta de Apple Developer ($99/año)
// Se deja configurado pero condicionalmente activo
// ================================
if (
  process.env.APPLE_CLIENT_ID &&
  process.env.APPLE_TEAM_ID &&
  process.env.APPLE_KEY_ID
) {
  try {
    const AppleStrategy = require('passport-apple');
    const fs = require('fs');

    let privateKeyString;
    if (process.env.APPLE_PRIVATE_KEY) {
      // Desde variable de entorno (producción)
      privateKeyString = process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n');
    } else if (process.env.APPLE_PRIVATE_KEY_PATH && fs.existsSync(process.env.APPLE_PRIVATE_KEY_PATH)) {
      privateKeyString = fs.readFileSync(process.env.APPLE_PRIVATE_KEY_PATH, 'utf8');
    }

    if (privateKeyString) {
      passport.use(
        new AppleStrategy(
          {
            clientID:    process.env.APPLE_CLIENT_ID,
            teamID:      process.env.APPLE_TEAM_ID,
            keyID:       process.env.APPLE_KEY_ID,
            privateKey:  privateKeyString,
            callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:5000/api/auth/apple/callback',
            scope: ['name', 'email'],
            passReqToCallback: false
          },
          async (accessToken, refreshToken, idToken, profile, done) => {
            try {
              const appleId = profile.id || idToken?.sub;
              const email   = profile.email || idToken?.email;
              const name    = profile.name
                ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
                : 'Usuario Apple';

              let user = await User.findOne({ where: { apple_id: appleId } });

              if (!user && email) {
                user = await User.findOne({ where: { email } });

                if (user) {
                  await user.update({
                    apple_id:         appleId,
                    auth_provider:    'apple',
                    is_email_verified: true,
                    last_login_at:    new Date()
                  });
                } else {
                  user = await User.create({
                    name:              name || 'Usuario Apple',
                    email:             email || `apple_${appleId}@placeholder.com`,
                    apple_id:          appleId,
                    auth_provider:     'apple',
                    is_email_verified: !!email,
                    is_active:         true,
                    last_login_at:     new Date()
                  });
                }
              } else if (user) {
                await user.update({ last_login_at: new Date() });
              }

              return done(null, user);
            } catch (error) {
              logger.error('Apple OAuth error:', error);
              return done(error, null);
            }
          }
        )
      );
      logger.info('✅ Apple OAuth strategy loaded');
    }
  } catch (e) {
    logger.warn('⚠️  Apple OAuth strategy not loaded (passport-apple not installed or missing config)');
  }
}

// Serialize/Deserialize (solo necesario si usamos sesiones — con JWT no es estrictamente necesario)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
