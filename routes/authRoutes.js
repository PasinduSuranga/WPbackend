const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const User = require('../models/user'); // ✅ Proper model import
const user = require('../models/user');

// Register
router.post('/register', register);

// Login
router.post('/login', login);

// Protected test route
router.get('/protected', protect, (req, res) => {
  res.json({
    message: 'You accessed a protected route!',
    user: req.user,
  });
});

// Get profile
router.get('/profile', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { username, email } = req.body;

    // If email is changing, ensure it's not already in use
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

// ✅ Change password route (corrected)
router.put('/change-password', protect, async (req, res) => {
  try {
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both current and new passwords are required' });
    }

    // Get the full user instance from DB
    const freshUser = await User.findById(currentUser._id);

    if (!freshUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    const isMatch = await freshUser.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const isSame = await freshUser.matchPassword(newPassword);
    if (isSame) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from the current password',
      });
    }

    // Set new password
    freshUser.password = newPassword;
    await freshUser.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Keep this at the very end
module.exports = router;
