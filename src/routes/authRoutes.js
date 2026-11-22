const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/auth');

// Public endpoints
router.post('/register-student', authController.registerStudent);
router.post('/login', authController.login);
router.post('/update-password', authController.updatePassword);

// Protected endpoints (Requires Authorization: Bearer <token>)
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
