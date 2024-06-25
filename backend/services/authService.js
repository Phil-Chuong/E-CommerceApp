const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const initializePassport = (passport, pool) => {
    const authenticateUser = async (email, password, done) => {
        try {
            const query = 'SELECT * FROM users WHERE email = $1';
            const result = await pool.query(query, [email]);
            const user = result.rows[0];

            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }

            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const query = 'SELECT * FROM users WHERE id = $1';
            const result = await pool.query(query, [id]);
            const user = result.rows[0];
            if (user) {
                done(null, user);
            } else {
                done(new Error('User not found'));
            }
        } catch (error) {
            done(error);
        }
    });
};

// backend/middleware/authMiddleware.js
const checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };
  
  const checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect('/HomePage');
    }
    next();
  };



module.exports = { initializePassport, checkAuthenticated, checkNotAuthenticated };