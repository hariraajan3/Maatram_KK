import express from 'express';
import { loginHandler, meHandler, listRoles } from '../controllers/authController.js';
import { withAuth } from '../middlewares/auth.js';

const router = express.Router();

router.post('/login', loginHandler);
router.get('/roles', listRoles);
router.get('/me', withAuth, meHandler);

export default router;
