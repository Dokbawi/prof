const express = require('express');
const app = express();
const database = require('./database/database.js');
const path = require('path');
const helmet = require('helmet');
const session = require('express-session');
const PORT = process.env.PORT || 3000;
const http = require('http').Server(app);
const socket = require('socket.io')(http);

app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'private');
    next();
});
app.use(helmet());

app.set('trust proxy', 1);
app.use(session({
    secret: '@#3123@$MYSIGsadsad@#@31N#@$#$',
    name: 'sessionID',
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, }

}));
app.set('views', path.join(__dirname, '/public'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use('/node_modules', express.static(path.join(__dirname, './node_modules')));
app.use('/css', express.static(path.join(__dirname, './static/css')));
app.use('/js', express.static(path.join(__dirname, './static/js')));
app.use('/image', express.static(path.join(__dirname, './static/image')));

const router = require('./router/router.js')(app, database, socket);

const chat = require('./router/chat/socket.js')(app, database, socket);




        

http.listen(PORT, function () {

    console.log('server on');
});


