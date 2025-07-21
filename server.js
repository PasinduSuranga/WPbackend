const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // ✅ database config
const authRoutes = require('./routes/authRoutes'); // ✅ route file

const app = express();

connectDB(); // ✅ connect to MongoDB

app.use(cors()); // ✅ allow frontend requests
app.use(express.json()); // ✅ parse incoming JSON

app.use('/api/auth', authRoutes); // ✅ this line enables the register route

app.get('/', (req, res) => {
  res.send('API Running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
