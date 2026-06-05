import express from 'express';
import { loginHandler, meHandler, setupAccountHandler } from '../controllers/authController.js';
import { withAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginHandler);
router.post('/setup-account', setupAccountHandler);

router.get('/me', withAuth, meHandler);

export default router;
