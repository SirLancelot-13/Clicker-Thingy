const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const expressSession = require('express-session');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma');
require('dotenv').config();

const authRouter = require('./routes/authRouter.js');
const indexRouter = require('./routes/indexRouter.js');

const app = express();
const port = process.env.PORT || 3000;

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
    adapter,
});

const { PrismaSessionStore } = require('@quixo3/prisma-session-store');

const passport = require('./passport.config.js');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(expressSession({
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    },
    secret: process.env.SECRET || 'skibidi bop',
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
        prisma,
        {
            modelName: 'Session',
            checkPeriod: 2 * 60 * 1000,  //ms
            dbRecordIdIsSessionId: true,
            dbRecordIdFunction: undefined,
        }
    )
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
app.use('/', indexRouter);

const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

io.on('connection', (socket) => {
    console.log('socket connected:', socket.id);
    //Updated this to update click count in db and broadcast the click has been made.
    socket.on('click', async (data) => {
        try {
            const username = data.by;
            const click = await prisma.click.findUnique({
                where: { username },
            })

            if (click) {
                await prisma.click.update({
                    where: { id: click.id },
                    data: { count: { increment: 1 } },
                })
            } else {
                await prisma.click.create({
                    data: {
                        count: 1,
                        user: { connect: { username } },
                    },
                })
            }
            // Broadcast the click data
            io.emit('click', data);
        } catch (error) {
            console.error('Error updating click count:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('socket disconnected:', socket.id);
    });
});

server.listen(port, () => console.log(`Server running on port ${port}`));