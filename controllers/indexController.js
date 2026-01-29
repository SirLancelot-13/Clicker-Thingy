exports.getHome = (req, res) => {
    res.send('Welcome to the Clicker Game API');
};

exports.getDashboard = (req, res) => {
    res.send(`Hello ${req.user.displayName || req.user.username}, welcome to your dashboard!`);
};

exports.getLeaderboard = (req, res) => {
    res.send('Add leaderboard here lazy ahh.');
};