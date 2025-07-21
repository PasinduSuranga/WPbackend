const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// This connects POST /api/auth/register to the register function
router.post('/register', register);
router.post('/login', login);


module.exports = router;
