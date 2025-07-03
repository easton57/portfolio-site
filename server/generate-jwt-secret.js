const crypto = require('crypto');

console.log('Generating secure JWT secret...\n');

// Generate a 64-byte random string in hexadecimal format
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('Your JWT secret:');
console.log(jwtSecret);
console.log('\nAdd this to your .env file as:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('\nKeep this secret secure and never share it publicly!');
