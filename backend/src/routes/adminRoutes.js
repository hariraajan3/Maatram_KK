const express = require('express');
const { getAuditLogs, getRoles, updateRolePermissions, assignRole, getUsers, deleteUser } = require('../controllers/adminController');
const { withAuth, requireRole } = require('../middlewares/auth');

const router = express.Router();

router.use(withAuth);

router.get('/logs', getAuditLogs);
router.get('/roles', getRoles);
router.put('/roles/permissions', updateRolePermissions);
router.get('/users', requireRole('admin'), getUsers);
router.post('/users/role', assignRole);
router.delete('/users/:userId', requireRole('admin'), deleteUser);

module.exports = router;
