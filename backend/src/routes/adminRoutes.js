import express from 'express';
import { getAuditLogs, getRoles, updateRolePermissions, assignRole, getUsers, deleteUser } from '../controllers/adminController.js';
import { withAuth, requireRole } from '../middlewares/auth.js';

const router = express.Router();

router.use(withAuth);
router.use(requireRole('ADMIN'));

router.get('/logs', getAuditLogs);
router.get('/roles', getRoles);
router.put('/roles/permissions', updateRolePermissions);
router.get('/users', getUsers);
router.post('/users/role', assignRole);
router.delete('/users/:userId', deleteUser);

export default router;
