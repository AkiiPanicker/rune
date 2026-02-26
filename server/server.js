require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.connect()
    .then(() => console.log('Mythic DB connected.'))
    .catch(err => console.error('Connection error', err.stack));

// A function to randomize User's Mythological Mark upon entry
const mythicRunes = ['ᛏ', 'ᛟ', 'ᛉ', 'ᛖ', 'ᚲ', 'ᚦ', 'ᚹ'];
const getRandomRune = () => mythicRunes[Math.floor(Math.random() * mythicRunes.length)];

// SIGNUP ROUTE (Assigning Runes & Free Entry Tiers)
app.post('/api/signup', async (req, res) => {
    const { name, reg_no, email, phone } = req.body;
    // Set Admins to DEITY tier natively
    const tier = (reg_no === '235805126') ? 'DEITY' : 'AWAKENED';
    const rune = getRandomRune();

    try {
        const result = await pool.query(
            'INSERT INTO users (name, reg_no, email, phone, ticket_tier, rune_mark) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, reg_no, email, phone, tier, rune]
        );
        res.status(201).json({ success: true, user: result.rows[0], message: "Summoning Complete." });
    } catch (error) {
        if (error.code === '23505') {
            res.status(400).json({ success: false, message: 'Already Summoned.' });
        } else {
            res.status(500).json({ success: false, message: 'A cosmic error occurred.' });
        }
    }
});

// LOGIN ROUTE (Deny Banned users access to the dashboard)
app.post('/api/login', async (req, res) => {
    const { email, reg_no } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1 AND reg_no = $2', [email, reg_no]);
        if (user.rows.length > 0) {
            const loggedInUser = user.rows[0];
            
            // THE BANISHMENT CHECK
            if (loggedInUser.is_banned) {
                return res.status(403).json({ success: false, message: 'YOUR SOUL HAS BEEN BANISHED. ENTRY FORBIDDEN.' });
            }

            res.status(200).json({ 
                success: true, 
                message: 'Welcome to the Pantheon.',
                user: { name: loggedInUser.name, reg_no: loggedInUser.reg_no, tier: loggedInUser.ticket_tier, rune: loggedInUser.rune_mark }
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Lore/Credentials.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during awakening.' });
    }
});

// ----------------- ORACLE / FAQ ENDPOINTS -----------------
// GET Approved FAQs for homepage
app.get('/api/faqs', async (req, res) => {
    try {
        const faqs = await pool.query('SELECT * FROM faqs ORDER BY id ASC');
        res.json({ success: true, data: faqs.rows });
    } catch(err) { res.status(500).json({success:false}); }
});

// User asks a new Question
app.post('/api/ask', async (req, res) => {
    const { reg_no, question } = req.body;
    try {
        await pool.query('INSERT INTO oracle_queries (asker_reg, question) VALUES ($1, $2)', [reg_no, question]);
        res.json({ success: true, message: 'The Oracle hears you.'});
    } catch (err) { res.status(500).json({success: false, message:'Whisper failed.'});}
});

// ----------------- ADMIN OMNISCIENCE ENDPOINTS -----------------
app.post('/api/admin/stats', async (req, res) => {
    if (req.body.reg_no !== '235805126') return res.status(403).json({ success: false });
    try {
        const count = await pool.query('SELECT COUNT(*) FROM users');
        const activeUsers = await pool.query('SELECT * FROM users ORDER BY id DESC'); // Giving Admin list of all
        const pendingQueries = await pool.query('SELECT * FROM oracle_queries ORDER BY id ASC');
        
        res.status(200).json({ success: true, totalUsers: count.rows[0].count, allUsers: activeUsers.rows, queries: pendingQueries.rows });
    } catch (error) { res.status(500).json({ success: false }); }
});
// ==================== DYNAMIC PUBLIC FETCH ROUTES ====================

// Get Artists
app.get('/api/artists', async (req, res) => {
    try {
        const artists = await pool.query('SELECT * FROM artists ORDER BY id ASC');
        res.json({ success: true, data: artists.rows });
    } catch(err) { res.status(500).json({success:false}); }
});

// Get Sponsors
app.get('/api/sponsors', async (req, res) => {
    try {
        const sponsors = await pool.query('SELECT * FROM sponsors ORDER BY id ASC');
        res.json({ success: true, data: sponsors.rows });
    } catch(err) { res.status(500).json({success:false}); }
});


// ==================== ADMIN CMS DYNAMIC CONTROLS ====================

// Add & Delete Artist
// Add & Delete Artist (Using External URLs now!)
app.post('/api/admin/add-artist', async (req, res) => {
    const { admin_reg, name, role, image_url } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });
    try {
        await pool.query('INSERT INTO artists (name, role, image_url) VALUES ($1, $2, $3)', [name, role, image_url]);
        res.json({ success: true });
    } catch(err) { res.status(500).json({success:false}); }
});
app.post('/api/admin/del-artist', async (req, res) => {
    const { admin_reg, id } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });
    try {
        await pool.query('DELETE FROM artists WHERE id = $1', [id]);
        res.json({ success: true });
    } catch(err) { res.status(500).json({success:false}); }
});

// Add & Delete Sponsor
app.post('/api/admin/add-sponsor', async (req, res) => {
    const { admin_reg, name, link_url } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });
    try {
        await pool.query('INSERT INTO sponsors (name, link_url) VALUES ($1, $2)', [name, link_url || '#']);
        res.json({ success: true });
    } catch(err) { res.status(500).json({success:false}); }
});

app.post('/api/admin/del-sponsor', async (req, res) => {
    const { admin_reg, id } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });
    try {
        await pool.query('DELETE FROM sponsors WHERE id = $1', [id]);
        res.json({ success: true });
    } catch(err) { res.status(500).json({success:false}); }
});

// Admin Bans a User
app.post('/api/admin/banish', async (req, res) => {
    const { admin_reg, target_reg } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });
    try {
        await pool.query('UPDATE users SET is_banned = TRUE WHERE reg_no = $1', [target_reg]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({success: false}); }
});

// Admin approves query into official FAQ
app.post('/api/admin/publish-faq', async (req, res) => {
    const { admin_reg, query_id, question, answer } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });
    try {
        await pool.query('INSERT INTO faqs (question, answer) VALUES ($1, $2)', [question, answer]);
        await pool.query('DELETE FROM oracle_queries WHERE id = $1', [query_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({success: false}); }
});
// --- NEW: Physical Gate Scanner Processing ---
app.post('/api/admin/scan', async (req, res) => {
    const { admin_reg, qr_data } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });

    // Ensure the QR is actually a RUNE domain pass
    if (!qr_data.startsWith('RUNE26-')) return res.status(400).json({ success: false, message: 'INVALID DOMAIN RIFT. FORGERY DETECTED.' });
    
    const target_reg = qr_data.replace('RUNE26-', '');
    try {
        // Find User
        const result = await pool.query('SELECT * FROM users WHERE reg_no = $1', [target_reg]);
        if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'SOUL NOT FOUND.' });

        const soul = result.rows[0];
        
        // Logical Gate Checks
        if (soul.is_banned) return res.status(403).json({ success: false, message: 'BANNED. ALERT GUARDS.' });
        if (soul.has_entered) return res.status(400).json({ success: false, message: 'SOUL IS ALREADY INSIDE THE REALM.' });

        // Update to Present
        await pool.query('UPDATE users SET has_entered = TRUE WHERE reg_no = $1', [target_reg]);
        res.status(200).json({ success: true, message: `ADMIT GRANTED: ${soul.name.toUpperCase()}` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server glitch processing admission.' });
    }
});

// --- NEW: Add FAQ Manually ---
app.post('/api/admin/add-faq-manual', async (req, res) => {
    const { admin_reg, question, answer } = req.body;
    if (admin_reg !== '235805126') return res.status(403).json({ success: false });
    try {
        await pool.query('INSERT INTO faqs (question, answer) VALUES ($1, $2)', [question, answer]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ success: false }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Realm running on port ${PORT}`));