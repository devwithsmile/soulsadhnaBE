import express from 'express';
import { register, login, googleAuth, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 */
router.post('/register', (req, res, next) => {
    register(req, res).catch(next);
});


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 */
router.post('/login', (req, res, next) => {
    login(req, res).catch(next);
});
/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google
 *     tags: [Auth]
 */
router.post('/google', (req, res, next) => {
    googleAuth(req, res).catch(next);
});

/**
 * @swagger
 * /api/auth/forgot:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 */
router.post('/forgot', (req, res, next) => {
    forgotPassword(req, res).catch(next);
});


/**
 * @swagger
 * /api/auth/reset:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 */
router.post('/reset', (req, res, next) => {
    resetPassword(req, res).catch(next);
});


export default router;