var cookieParser = require('cookie-parser');
var session = require('express-session');

// подключение модуля connect-mssql
var MSSQLStore = require('connect-mssql')(session);
var mssql = require('mssql'); 

module.exports = {
    createStore: function () {
        var config = {
            user: 'Maria',                      // пользователь базы данных
            password: '12345',                  // пароль пользователя 
            server: 'LAPTOP-RPD6D51R\\SQLEXPRESS01',          // хост
            database: 'test',                // имя бд
            port: 1433,                         // порт, на котором запущен sql server
            options: {
                encrypt: true,                  // Использование SSL/TLS
                trustServerCertificate: true    // Отключение проверки самоподписанного сертификата
            },
        }

        return new MSSQLStore(config);
    }
}