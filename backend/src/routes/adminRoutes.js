import express from 'express';
import { getAuditLogs, getUsers, deleteUser } from '../controllers/adminController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(withAuth);
router.use(requireRole('ADMIN'));

router.get('/logs', getAuditLogs);
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);

export default router;
