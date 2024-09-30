var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');
var mssql = require('mssql');
var path = require('path');

var jsonParser = bodyParser.json();
app.use(jsonParser);

var port = 8080;

var connection = require('./js/config');
// создание хранилища для сессий 
var sessionHandler = require('./js/session_handler');
var store = sessionHandler.createStore();

// создание сессии 
app.use(cookieParser());
app.use(session({
    saveUninitialized: true,
    secret: 'supersecret'
}));

app.set('views', path.join(__dirname, 'pages'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/login', (req, res) => {
    const login = req.body.username;
    console.log(login);
    const password = req.body.password;
    console.log(password);

    const request = new mssql.Request(connection);
        request.input('login', mssql.VarChar, login);  
        request.input('password', mssql.VarChar, password);

        request.query('SELECT * FROM Users WHERE login=@login AND password=@password', (err, result) => {
            if (err) {
                console.error('Ошибка выполнения запроса:', err);
                return res.status(500).send('Произошла ошибка при получении данных');
            }

            if (result.recordset.length === 1) {
                req.session.username = login; 
                console.log("Login succeeded: ", login);
                return res.send('Login successful: ' + 'sessionID: ' + req.session.id + '; user: ' + login);
            } else {
                console.log("Login failed: ", login);
                return res.status(401).send('Login error');
            }
        });
});


app.get('/logout', function (req, res) {
    req.session.username = '';
    console.log('logged out');
    res.send('logged out!');
});

// ограничение доступа к контенту на основе авторизации 
app.get('/admin', function (req, res) {
    // страница доступна только для админа 
    if (req.session.username == 'admin') {
        console.log(req.session.username + ' requested admin page');
        res.render('admin_page');
    } else {
        res.status(403).send('Access Denied!');
    }

});

app.get('/user', function (req, res) {
    // страница доступна для любого залогиненного пользователя 
    if (req.session.username.length > 0) {
        console.log(req.session.username + ' requested user page');
        res.render('user_page');
    } else {
        res.status(403).send('Access Denied!');
    };
});

app.get('/guest', function (req, res) {
    // страница без ограничения доступа 
    res.render('guest_page');
});

app.listen(port, function () {
    console.log('app running on port ' + port);
})
