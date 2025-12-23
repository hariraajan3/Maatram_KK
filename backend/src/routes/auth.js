import express from 'express';
import { loginHandler, meHandler } from '../controllers/authController.js';
import { withAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginHandler);

router.get('/me', withAuth, meHandler);

export default router;
