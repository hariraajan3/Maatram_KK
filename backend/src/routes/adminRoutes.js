const express = require('express');
const { getAuditLogs, getRoles, updateRolePermissions, assignRole } = require('../controllers/adminController');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticate);

router.get('/logs', getAuditLogs);
router.get('/roles', getRoles);
router.put('/roles/permissions', updateRolePermissions);
router.post('/users/role', assignRole);

module.exports = router;
