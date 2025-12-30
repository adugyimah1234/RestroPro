const bcrypt = require('bcrypt');

const password = '_Morrison.1';
const saltRounds = 10; // You can adjust the salt rounds, 10 is a good default

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Hashed password:', hash);
});
