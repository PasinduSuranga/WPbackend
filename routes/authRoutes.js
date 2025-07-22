const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const User = require('../models/user'); // ✅ Proper naming (uppercase)

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Protected test route
router.get('/protected', protect, (req, res) => {
  res.json({
    message: 'You accessed a protected route!',
    user: req.user,
  });
});

// Get profile route
router.get('/profile', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Update profile route
router.put('/profile', protect, async (req, res) => {
  try {
    const loggedInUser = req.user; // renamed for clarity
    const { username, email } = req.body;

    // Check if email is changing and already used by another user
    if (email && email !== loggedInUser.email) {
      const emailExists = await User.findOne({ email });

      if (emailExists && emailExists._id.toString() !== loggedInUser._id.toString()) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      loggedInUser.email = email;
    }

    if (username) {
      loggedInUser.username = username;
    }

    await loggedInUser.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: loggedInUser._id,
        username: loggedInUser.username,
        email: loggedInUser.email,
        role: loggedInUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router; // ✅ keep this last
