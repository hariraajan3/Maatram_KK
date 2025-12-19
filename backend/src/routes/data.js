import express from 'express';
import { importStudents, exportStudents } from '../controllers/dataController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.post('/students/import', withAuth, requireRole('admin'), importStudents);
router.get('/students/export', withAuth, requireRole('admin', 'tutorLead'), exportStudents);

export default router;

