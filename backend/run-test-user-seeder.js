require('dotenv').config({ path: './.env' });
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const { URL } = require('url');

async function runTestUserSeeder() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set.');
    }

    const parsedUrl = new URL(databaseUrl);

    const connection = await mysql.createConnection({
        host: parsedUrl.hostname,
        user: parsedUrl.username,
        password: parsedUrl.password,
        database: parsedUrl.pathname.substring(1), // Remove leading '/'
        port: parsedUrl.port || 3306 // Default MySQL port
    });

    try {
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash('password123', 10); // Hash 'password123' with salt rounds 10

        // Check if test user already exists
        let [users] = await connection.execute(
            `SELECT id FROM Users WHERE email = ?`,
            ['test@example.com']
        );

        if (users.length === 0) {
            await connection.execute(
                `INSERT INTO Users (username, email, password, createdAt, updatedAt, role) VALUES (?, ?, ?, NOW(), NOW(), ?)`,
                ['testuser', 'test@example.com', hashedPassword, 'user'] // Assuming default role 'user'
            );
            console.log('Test user created.');
        } else {
            console.log('Test user already exists.');
            // Optionally update existing test user if needed
            await connection.execute(
                `UPDATE Users SET password = ?, role = ?, updatedAt = NOW() WHERE email = ?`,
                [hashedPassword, 'user', 'test@example.com']
            );
            console.log('Test user updated.');
        }

        await connection.commit();
        console.log('Test user seeder complete.');
    } catch (error) {
        await connection.rollback();
        console.error('Error running test user seeder:', error);
    } finally {
        connection.end();
    }
}

runTestUserSeeder();
