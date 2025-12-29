import express from 'express';
import { importStudents, exportStudents, generateDummyData, getDatabaseSummary } from '../controllers/dataController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

// Public routes for Development/Testing
router.post('/generate-dummy', generateDummyData);
router.get('/summary', getDatabaseSummary);

// Protected routes
router.post('/students/import', withAuth, requireRole('admin'), importStudents);
router.get('/students/export', withAuth, requireRole('admin', 'tutorLead'), exportStudents);

export default router;

