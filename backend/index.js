const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const path = require('path');
const { Pool } = require('pg');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Import config and services
const config = require('./config');
require('dotenv').config();

// Initialize the app
const app = express();

// Database connection
const pool = new Pool({
  connectionString: process.env.DB_CONFIG,
  // ssl: {
  //   rejectUnauthorized: false // Required for some PostgreSQL hosts
  // }
});

// Allow requests from specific origins
app.use(cors({
  origin: 'http://localhost:3000', // Adjust the port as needed
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies or other credentials
}));
// app.use(cors({
//   origin: 'https://tech-titan.onrender.com', // Allow specific origin
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true, // Allow cookies or other credentials
// }));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Session middleware
app.use(session({ 
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
const { initializePassport } = require('./services/authService');
initializePassport(passport, new Pool(config.DB_CONFIG));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Global variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Serve static files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_KEY);

// Import routes
const authGoogleRouter = require('./routes/authRoutes');
const authRouter = require('./routes/auth');
const productRouter = require('./routes/products');
const productRoutes = require('./routes/products');
const cartRouter = require('./routes/cart');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/order');
const checkoutRouter = require('./routes/checkout');
const searchRouter = require('./routes/search');


// Routes halders
app.use('/auth', authRouter);
app.use('/products', productRouter);
app.use('/products', productRoutes);
app.use('/authRoutes', authGoogleRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/search', searchRouter);


// Serve static files from the React app
app.use(express.static(path.join(__dirname, '/public')));


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public', 'index.html'));
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
        //url: 'https://techtitan.onrender.com',  // Update this URL
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


//testing ROUTES
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database connection is working', time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err.message);
    res.status(500).json({ error: 'Database connection error' });
  }
});


// Redirect root URL to login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
