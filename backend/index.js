// const dotenv = require('dotenv');
const dotenv = require('dotenv');
dotenv.config();
const config = require('./config');

const { Pool }= require('pg');
const path = require('path');

const express = require('express');
const Stripe = require('stripe');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const flash = require('express-flash');
const methodOverride = require('method-override');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');


//Load the database URL from the environment variable
const pool = new Pool({
  connectionString: config.DB_CONFIG.connectionString,  // Use the DATABASE_URL
  ssl: config.DB_CONFIG.ssl
});

console.log('Connecting to database with URL:', process.env.DATABASE_URL);

const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to the database');

    const tables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    console.log('Tables:', tables.rows);

    client.release();
  } catch (error) {
    console.error('Error:', error);
  }
};

testConnection();


// Connect to the database
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Connection error', err.stack));

  // console.log('Connecting with:', config.DB.PGUSER, config.DB.PGHOST);
  console.log('Connection string:', config.DB_CONFIG.connectionString);
  pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'', (err, result) => {
    if (err) {
      console.error('Error fetching tables:', err);
    } else {
      console.log('Tables:', result.rows);
    }
  });
  

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


// Import config and services

//const pool = require('./DB/db');
const { initializePassport } = require('./services/authService');

const app = express();

// Initialize Stripe
const stripe = Stripe(process.env.STRIPE_KEY);

//Enable CORS
app.use(cors());

//Method Override
app.use(methodOverride('_method'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());

// Initialize Passport
initializePassport(passport, new Pool(config.DB_CONFIG));

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

// Global variables
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));


// Routes
app.use('/auth', authRouter);
app.use('/products', productRouter);
app.use('/products', productRoutes);
app.use('/authRoutes', authGoogleRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/search', searchRouter);

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ message: 'Database is connected', time: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection error' });
  }
});

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
        url: `http://localhost:${config.PORT}`,
      },
    ],
  },
  apis: ['./routes/*.js', './models/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


// Redirect root URL to login page
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Start server
app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
