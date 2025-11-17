const { Router } = require('express');
const { getDashboard } = require('../controllers/dashboardController');
const { withAuth } = require('../middlewares/auth');

const router = Router();

router.get('/', withAuth, getDashboard);

module.exports = router;

