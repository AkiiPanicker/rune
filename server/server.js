require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve Static Frontend files exactly as they are from /public
app.use(express.static(path.join(__dirname, '../public')));

// Database connection
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// TEST Route just to check DB
pool.connect()
    .then(() => console.log('Mythic DB connected.'))
    .catch(err => console.error('Connection error', err.stack));

// Sign Up Route
app.post('/api/signup', async (req, res) => {
    const { name, reg_no, email, phone } = req.body;
    
    try {
        // Insert into database
        const result = await pool.query(
            'INSERT INTO users (name, reg_no, email, phone) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, reg_no, email, phone]
        );
        res.status(201).json({ success: true, user: result.rows[0], message: "Summoning Complete." });
    } catch (error) {
        if (error.code === '23505') { // Postgres Unique Constraint violation
            res.status(400).json({ success: false, message: 'User with this Email or Reg Number already summoned.' });
        } else {
            console.error(error);
            res.status(500).json({ success: false, message: 'A cosmic error occurred.' });
        }
    }
});

// Login Route (Authenticating with Email and Reg Number as per instructions)
app.post('/api/login', async (req, res) => {
    const { email, reg_no } = req.body;
    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND reg_no = $2',
            [email, reg_no]
        );
        if (user.rows.length > 0) {
            res.status(200).json({ success: true, message: 'Welcome to the Pantheon.' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Lore/Credentials.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during awakening.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Realm running on port ${PORT}`);
});