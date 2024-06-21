const bcrypt = require('bcrypt');

//Initialize Passport
const initializePassport = (passport, pool) => {
    const LocalStrategy = require('passport-local').Strategy;

    const authenticateUser = async (email, password, done) => {
        try {
            const user = await getUserByEmail(pool, email);
            console.log('User', user);
            if (!user) {
                return done(null, false, { message: 'No user with that email' });
            }

            console.log('Password:', user.password);
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (error) {
            console.error('Error in bcrypt compare:', error);
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
                done({ message: 'User not found' }, null);
            }
        } catch (error) {
            console.error('Error in deserializeUser:', error);
            done(error, null);
        }
    });
};


//GET users Email
const getUserByEmail = async (pool, email) => {
    try {
        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await pool.query(query, [email]);
        return result.rows[0]; // This will return the first user found with the specified email
    } catch (error) {
        throw error;
    }
};

// Redirect when user is Authenticated
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

module.exports = { 
    initializePassport,
    checkAuthenticated, 
    checkNotAuthenticated,
};