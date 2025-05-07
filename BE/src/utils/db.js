const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: "user1",
    password: "",
    database: "cnpm"
}).promise();

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err.stack);
        return;
    }
    console.log('Connected to MySQL database as id ' + connection.threadId);
});

module.exports = connection;