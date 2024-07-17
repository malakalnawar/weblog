// clean-db.js
const fs = require('fs');

// Path to the database file
const dbPath = 'database.db';

// Delete the database file if it exists
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Database deleted successfully.');
} else {
  console.log('Database file does not exist.');
}