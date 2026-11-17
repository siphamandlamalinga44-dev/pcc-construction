// Reset the admin password from the command line.
// Usage: node set-password.js <new-password>
// Requires the server to be restarted afterwards to pick up the new password.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ADMIN_FILE = path.join(__dirname, 'data', 'admin.json');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

const password = process.argv[2];
if (!password || password.length < 6) {
  console.error('Usage: node set-password.js <new-password> (minimum 6 characters)');
  process.exit(1);
}

const salt = crypto.randomBytes(16).toString('hex');
fs.writeFileSync(
  ADMIN_FILE,
  JSON.stringify({ salt, hash: hashPassword(password, salt) }, null, 2)
);
console.log('Admin password updated. Restart the server, then log in with the new password.');
