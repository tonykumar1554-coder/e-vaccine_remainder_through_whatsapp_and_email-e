const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const seedDatabase = require('./utils/seedData');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend integration
app.use(
  cors({
    origin: '*', // Allows connections from React/Vite development or production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Express JSON body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check and root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Vaccine Reminder API is online and healthy.',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth (POST /register, POST /login, GET /me)',
      vaccines: '/api/vaccines (GET, POST, PUT, DELETE, POST /seed)',
      children: '/api/children (GET, POST, PUT, DELETE)',
      records: '/api/records (GET, POST, PUT, DELETE)',
      appointments: '/api/appointments (GET, POST, PUT, DELETE)',
      reminders: '/api/reminders (GET, PUT /:id/read, POST /refresh)',
      users: '/api/users (GET, GET /doctors, PUT /:id/role, DELETE)',
      stats: '/api/stats/dashboard',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date() });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth_routes'));
app.use('/api/users', require('./routes/user_routes'));
app.use('/api/vaccines', require('./routes/vaccine_routes'));
app.use('/api/children', require('./routes/child_routes'));
app.use('/api/records', require('./routes/record_routes'));
app.use('/api/appointments', require('./routes/appointment_routes'));
app.use('/api/reminders', require('./routes/reminder_routes'));
app.use('/api/stats', require('./routes/stats_routes'));
app.use('/api/doctors', require('./routes/doctor_routes'));
app.use('/api/patients', require('./routes/patients_routes'));

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} not found on this server.`,
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Initialize Database connection and start server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 E-Vaccine Reminder Server listening on port ${PORT}`);
      console.log(`📡 Base API URL: http://localhost:${PORT}`);
      console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error.message);
  }
};

startServer();

module.exports = app;
