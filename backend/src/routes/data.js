const { Router } = require('express');
const { importStudents, exportStudents } = require('../controllers/dataController');
const { withAuth, requireRole } = require('../middlewares/auth');

const router = Router();

router.post('/students/import', withAuth, requireRole('admin'), importStudents);
router.get('/students/export', withAuth, requireRole('admin', 'tutorLead'), exportStudents);

module.exports = router;

