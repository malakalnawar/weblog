// build-db.js
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Read the SQL schema file
const schema = fs.readFileSync('db_schema.sql', 'utf8');

// Open the database
const db = new sqlite3.Database('database.db');

// Execute the SQL schema
db.exec(schema, (err) => {
  if (err) {
    console.error('Error executing schema:', err);
  } else {
    console.log('Database built successfully.');
  }
  db.close();
});