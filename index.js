const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require("body-parser");
const session = require('express-session');
const crypto = require('crypto');

// Generate a random 32 character string for session secret
const secret = crypto.randomBytes(32).toString('hex');

// Set up SQLite database connection
const sqlite3 = require('sqlite3').verbose();
global.db = new sqlite3.Database('./database.db', function(err) {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    } else {
        console.log("Database connected");
        global.db.run("PRAGMA foreign_keys=ON");
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse url-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve Bootstrap from node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Configure express-session middleware
app.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: true,
}));

// Route handlers
const publicRoutes = require('./routes/public');
const authorRoutes = require('./routes/author');
const adminRoutes = require('./routes/admin');

app.use('/', publicRoutes);
app.use('/author', authorRoutes);
app.use('/admin', adminRoutes);

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});