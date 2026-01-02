import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { withAuth } from '../middlewares/auth.js';

const router = express.Router();

router.use(withAuth);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
