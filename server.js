const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('✅ API Running');
});

// Start Server only after DB connects
const startServer = async () => {
  try {
    await connectDB(); // Ensure DB is connected before starting the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1); // Exit if DB connection fails
  }
};

startServer(); // Call async start function
