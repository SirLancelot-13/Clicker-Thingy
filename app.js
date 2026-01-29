const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const expressSession = require('express-session');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('./generated/prisma/client.js');
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
    //Mock thingy for click event. Actually cause this to increase click count by 1 in DB and broadcast new count to all clients
    socket.on('click', (data) => {
        io.emit('click', data);
    });

    socket.on('disconnect', () => {
        console.log('socket disconnected:', socket.id);
    });
});

server.listen(port, () => console.log(`Server running on port ${port}`));