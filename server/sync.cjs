require('dotenv').config();
const cron = require('node-cron');
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

async function sync() {
    try {
        console.log("Running sync...");
        const res = await axios.get('https://print.newpaltz.edu/api/data/acs_printer_data.json');
        const data = res.data;

        await db.execute(`
            UPDATE printers 
            SET is_error = 0, black = NULL, cyan = NULL, magenta = NULL, yellow = NULL
        `);

        let allPrinters = [];
        for (let p of data.devices) { p.is_error = false; allPrinters.push(p); }
        for (let p of data.devices_error) { p.is_error = true; allPrinters.push(p); }

        console.log("Total printers from API:", allPrinters.length);

        for (const p of allPrinters) {
            p.black   = p.black   != null ? parseInt(p.black)   : null;
            p.cyan    = p.cyan    != null ? parseInt(p.cyan)    : null;
            p.magenta = p.magenta != null ? parseInt(p.magenta) : null;
            p.yellow  = p.yellow  != null ? parseInt(p.yellow)  : null;

            await db.execute(`
                INSERT INTO printers 
                (serial_number, name, ip, location, status, uptime, hardware, page_count, color, is_error, black, cyan, magenta, yellow)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name), ip = VALUES(ip), location = VALUES(location),
                    status = VALUES(status), uptime = VALUES(uptime), hardware = VALUES(hardware),
                    page_count = VALUES(page_count), color = VALUES(color), is_error = VALUES(is_error),
                    black = VALUES(black), cyan = VALUES(cyan), magenta = VALUES(magenta), yellow = VALUES(yellow)
            `, [
                p.serial_number || p.name, p.name, p.ip, p.location,
                p.status || "OK", p.uptime, p.hardware || null,
                parseInt(p.page_count) || 0, p.color || false, p.is_error ? 1 : 0,
                p.black, p.cyan, p.magenta, p.yellow
            ]);
        }

        console.log("SYNC COMPLETE:", allPrinters.length);
    } catch (err) {
        console.error("SYNC ERROR:", err.message);
    }
}

console.log("!Starting initial sync!");
sync();

cron.schedule('*/2 * * * *', () => {
    console.log("CRON FIRED at:", new Date().toLocaleTimeString());
    sync();
});

app.get('/printers', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM printers');
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error fetching printers");
    }
});

app.get('/history/:serial', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT wh.work_id, wh.notes, wh.created_at, u.username
            FROM work_history wh
            JOIN users u ON wh.user_id = u.user_id
            WHERE wh.printer_serial = ?
            ORDER BY wh.created_at DESC
        `, [req.params.serial]);
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error fetching history");
    }
});

app.post('/history', async (req, res) => {
    try {
        const { printer_serial, user_id, notes } = req.body;
        if (!printer_serial || !user_id || !notes) return res.status(400).send("Missing fields");
        await db.execute(`INSERT INTO work_history (printer_serial, user_id, notes) VALUES (?, ?, ?)`, [printer_serial, user_id, notes]);
        res.send("History added");
    } catch (err) {
        res.status(500).send("Error adding history");
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        res.json({ message: "Registered successfully" });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Username already exists" });
        res.status(500).json({ message: "Server error" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const [rows] = await db.query(
            'SELECT user_id, username FROM users WHERE username = ? AND password = ?',
            [username, password]
        );
        if (rows.length > 0) {
            res.json({ message: "Login successful", user_id: rows[0].user_id, username: rows[0].username });
        } else {
            res.status(401).json({ message: "Invalid login" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/locations', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM locations ORDER BY type, group_name, name');
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error fetching locations");
    }
});

app.get('/toner/:location_id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT tl.log_id, tl.toner_model, tl.quantity, tl.counted_at, u.username AS counted_by
            FROM toner_log tl
            JOIN users u ON tl.counted_by = u.user_id
            WHERE tl.location_id = ?
            ORDER BY tl.toner_model ASC
        `, [req.params.location_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error fetching toner log");
    }
});

app.post('/toner', async (req, res) => {
    try {
        const { location_id, toner_model, quantity, user_id } = req.body;
        if (!location_id || !toner_model || quantity == null || !user_id) return res.status(400).send("Missing fields");
        await db.execute(`
            INSERT INTO toner_log (location_id, toner_model, quantity, counted_by)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                quantity = VALUES(quantity),
                counted_by = VALUES(counted_by),
                counted_at = CURRENT_TIMESTAMP
        `, [location_id, toner_model, quantity, user_id]);
        res.send("Toner count updated");
    } catch (err) {
        res.status(500).send("Error updating toner count");
    }
});

app.delete('/toner/:log_id', async (req, res) => {
    try {
        await db.execute('DELETE FROM toner_log WHERE log_id = ?', [req.params.log_id]);
        res.send("Deleted");
    } catch (err) {
        res.status(500).send("Error deleting toner entry");
    }
});

app.get('/paper/:location_id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT pl.log_id, pl.quantity, pl.counted_at, u.username AS counted_by
            FROM paper_log pl
            JOIN users u ON pl.counted_by = u.user_id
            WHERE pl.location_id = ?
        `, [req.params.location_id]);
        res.json(rows);
    } catch (err) {
        res.status(500).send("Error fetching paper log");
    }
});

app.post('/paper', async (req, res) => {
    try {
        const { location_id, quantity, user_id } = req.body;
        if (!location_id || quantity == null || !user_id) return res.status(400).send("Missing fields");
        await db.execute(`
            INSERT INTO paper_log (location_id, quantity, counted_by)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                quantity = VALUES(quantity),
                counted_by = VALUES(counted_by),
                counted_at = CURRENT_TIMESTAMP
        `, [location_id, quantity, user_id]);
        res.send("Paper count updated");
    } catch (err) {
        res.status(500).send("Error updating paper count");
    }
});

app.delete('/paper/:log_id', async (req, res) => {
    try {
        await db.execute('DELETE FROM paper_log WHERE log_id = ?', [req.params.log_id]);
        res.send("Deleted");
    } catch (err) {
        res.status(500).send("Error deleting paper entry");
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server running on http://localhost:" + (process.env.PORT || 3000));
});