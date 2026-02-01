const { Router } = require('express');
const router = Router();
const indexController = require('../controllers/indexController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Fix this in the future lmao
router.get('/', authMiddleware.isAuthenticated,(req, res) => {
    res.render('dashboard', { user: req.user.username});
});


router.get('/dashboard', authMiddleware.isAuthenticated, indexController.getDashboard);
router.get('/leaderboard', indexController.getLeaderboard);
router.get('/logout', indexController.logout);
module.exports = router;