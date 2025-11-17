const { Router } = require('express');
const { loginHandler, meHandler, listRoles } = require('../controllers/authController');
const { withAuth } = require('../middlewares/auth');

const router = Router();

router.post('/login', loginHandler);
router.get('/roles', listRoles);
router.get('/me', withAuth, meHandler);

module.exports = router;

