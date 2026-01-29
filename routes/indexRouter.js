const { Router } = require('express');
const router = Router();
const indexController = require('../controllers/indexController.js');
const authMiddleware = require('../middleware/authMiddleware.js');

// Fix this in the future lmao
router.get('/', authMiddleware.isAuthenticated,(req, res) => {
    res.send(`<!doctype html>
<html>
    <head>
        <meta charset="utf-8" />
        <title>Clicker Game — Socket.io Test</title>
    </head>
    <body>
        <h1>Clicker Game — Socket.io Test</h1>
        <button id="btn">Send click</button>
        <pre id="log"></pre>

        <script src="/socket.io/socket.io.js"></script>
        <script>
            const socket = io();
            const btn = document.getElementById('btn');
            const log = document.getElementById('log');

            socket.on('connect', () => {
                console.log('connected', socket.id);
            });

            btn.addEventListener('click', () => {
                const payload = { at: Date.now(), by: socket.id };
                socket.emit('click', payload);
            });

            socket.on('click', (data) => {
                log.textContent = JSON.stringify(data, null, 2);
            });
        </script>
    </body>
</html>`);
});


router.get('/dashboard', authMiddleware.isAuthenticated, indexController.getDashboard);
router.get('/leaderboard', indexController.getLeaderboard);

module.exports = router;