import express from 'express';
import { getDashboard } from '../controllers/dashboardController.js';
import { withAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', withAuth, getDashboard);

export default router;

