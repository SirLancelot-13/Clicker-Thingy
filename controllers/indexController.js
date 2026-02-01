const { PrismaClient } = require('../generated/prisma/client.js');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

exports.getHome = (req, res) => {
    res.send('Welcome to the Clicker Game API');
};

exports.getDashboard = (req, res) => {
    res.send(`Hello ${req.user.displayName || req.user.username}, welcome to your dashboard!`);
};

exports.getLeaderboard = async (req, res) => {
    try {
        const clicks = await prisma.Click.findMany({
            include: { user: true },
            orderBy: { count: 'desc' }
        });
        res.json(clicks);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).send('Error fetching leaderboard');
    }
};

exports.logout = (req,res)=>{
    req.logout((err)=>{
        if (err){
            console.log(err);
            return res.status(500).send('Error logging out');
        }
        else{
            res.redirect('/');
        }
    })
}