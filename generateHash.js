// generateHash.js
const bcrypt = require('bcrypt');

const password = 'admin123'; // ← This is your plain-text password

bcrypt.hash(password, 10)
  .then(hash => {
    console.log('✅ Your hashed password:');
    console.log(hash);
    console.log('\nUse this hash in MongoDB Atlas.');
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });