const { PrismaClient } = require('../generated/prisma/client.js');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

exports.getHome = (req, res) => {
    res.send('Welcome to the Clicker Game API');
};

exports.getDashboard = async (req, res) => {
    try {
        const user = req.user;
        const clicks = await prisma.click.findUnique({
            where: {
                username: user.username
            }
        });

        const clickNumber = clicks ? clicks.count : 0;
        res.render('dashboard', { user: user.username, clicks: clickNumber });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).send('Error loading dashboard');
    }
};

exports.getLeaderboard = async (req, res) => {
    try {
        const clicks = await prisma.click.findMany({
            include: { user: true },
            orderBy: { count: 'desc' }
        });
        res.json(clicks);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Error fetching leaderboard');
    }
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Error logging out');
        }
        else {
            res.redirect('/');
        }
    })
}