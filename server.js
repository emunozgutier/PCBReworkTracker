import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { db, initDb } from './db.js';

const app = express();
const port = 5002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize Database
initDb();

// Routes

// Dashboard Summary
app.get('/api/dashboard', (req, res) => {
    const stats = {};
    db.get("SELECT COUNT(*) as count FROM projects", [], (err, row) => {
        if (err || !row) stats.projects = 0; else stats.projects = row.count;
        db.get("SELECT COUNT(*) as count FROM pcbs", [], (err, row) => {
            if (err || !row) stats.pcbs = 0; else stats.pcbs = row.count;
            db.get("SELECT COUNT(*) as count FROM owners", [], (err, row) => {
                if (err || !row) stats.owners = 0; else stats.owners = row.count;
                db.get("SELECT COUNT(*) as count FROM reworks", [], (err, row) => {
                    if (err || !row) stats.reworks = 0; else stats.reworks = row.count;
                    db.get("SELECT COUNT(*) as count FROM tags", [], (err, row) => {
                        if (err || !row) stats.tags = 0; else stats.tags = row.count;
                        res.json(stats);
                    });
                });
            });
        });
    });
});

// Projects API
app.get('/api/projects', (req, res) => {
    db.all("SELECT * FROM projects", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/projects', (req, res) => {
    const { name, description } = req.body;
    db.run("INSERT INTO projects (name, description) VALUES (?, ?)", [name, description], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name });
    });
});

// PCBs API
app.get('/api/pcbs', (req, res) => {
    const query = `
        SELECT pcbs.*, projects.name as project_name, owners.name as owner_name 
        FROM pcbs 
        LEFT JOIN projects ON pcbs.project_id = projects.id
        LEFT JOIN owners ON pcbs.owner_id = owners.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => ({
            id: row.id,
            board_number: row.board_number,
            status: row.status,
            project: row.project_name,
            owner: row.owner_name || 'Unassigned',
            product: row.product_name_and_rev
        })));
    });
});

app.post('/api/pcbs', (req, res) => {
    const { board_number, status, product_name_and_rev, project_id, owner_id } = req.body;
    const query = "INSERT INTO pcbs (board_number, status, product_name_and_rev, project_id, owner_id) VALUES (?, ?, ?, ?, ?)";
    db.run(query, [board_number, status, product_name_and_rev, project_id, owner_id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, board_number });
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
