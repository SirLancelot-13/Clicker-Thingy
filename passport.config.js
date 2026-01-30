const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { PrismaClient } = require('./generated/prisma/client.js');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
},
    async function (accessToken, refreshToken, profile, cb) {
        try {
            let user = await prisma.User.findUnique({
                where: { googleId: profile.id }
            });

            if (!user) {
                user = await prisma.User.create({
                    data: {
                        googleId: profile.id,
                        username: profile.emails[0].value,
                        displayName: profile.displayName
                    }
                });
            }
            return cb(null, user);
        } catch (err) {
            return cb(err);
        }
    }));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.User.findUnique({ where: { id } });
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;