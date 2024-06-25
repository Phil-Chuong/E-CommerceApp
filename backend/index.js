// const dotenv = require('dotenv');
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const authRoutes = require('./routes/authRoutes');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/order');
const config = require('./config');
const pool = require('./DB/db');
const { initializePassport } = require('./services/authService');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();



//Method Override
app.use(methodOverride('_method'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Initialize Passport
initializePassport(passport, pool);

// Session middleware
app.use(session({ 
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//BodyParser
app.use(bodyParser.json());

// Global variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use('/auth', authRouter);
app.use('/products', productRouter);
app.use('/auth', authRoutes);
app.use('/cart', cartRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Redirect root URL to login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Swagger options
const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'E-Commerce REST API',
      version: '1.0.0',
      description: 'E-commerce shopping back-end API server',
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
