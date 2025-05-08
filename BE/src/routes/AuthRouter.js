const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/AuthController');
// const AuthMiddleware = require('./AuthMiddleware');

router.get('/me',AuthController.check)
router.post('/sign_up', AuthController.createUser)
router.post('/log_out', AuthController.logout);
router.post('/log_in', AuthController.login);
router.post('/forgot_password', AuthController.forgotPassword);
router.post('/change_password', AuthController.changePassword);

module.exports = router