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
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});

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

// --- Helpers ---
function sanitizeProjectName(name) {
    if (!name) return "";
    // Remove non-alphanumeric characters but keep spaces for splitting
    const clean = name.replace(/[^a-zA-Z0-9\s]/g, '');
    // Split by spaces, filter empty, capitalize (PascalCase), and join
    return clean
        .split(/\s+/)
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}

function generateProjectKey(name, attempt = 1) {
    return new Promise((resolve, reject) => {
        if (attempt > 20) return reject(new Error("Unable to generate unique project key"));
        
        // Grab alpha chars
        let chars = name.replace(/[^A-Za-z]/g, '').toUpperCase();
        if (chars.length < 2) chars = chars + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        
        let proposedKey = chars[0] + chars[1];
        
        if (attempt > 1) {
            const i1 = Math.floor(Math.random() * chars.length);
            const i2 = Math.floor(Math.random() * chars.length);
            proposedKey = chars[i1] + chars[i2];
        }

        db.get("SELECT id FROM projects WHERE project_key = ?", [proposedKey], (err, row) => {
            if (err) return reject(err);
            if (row) {
                resolve(generateProjectKey(name, attempt + 1));
            } else {
                resolve(proposedKey);
            }
        });
    });
}

// Projects API
app.get('/api/projects', (req, res) => {
    const query = `
        SELECT projects.*, 
        COUNT(pcbs.id) as pcb_count,
        GROUP_CONCAT(pcbs.board_number) as pcb_list
        FROM projects
        LEFT JOIN pcbs ON projects.id = pcbs.project_id
        GROUP BY projects.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(row => ({
            ...row,
            revisions: row.revisions ? row.revisions.split(',').map(r => r.trim()) : [],
            pcbs: row.pcb_list ? row.pcb_list.split(',') : []
        })));
    });
});

app.post('/api/projects', async (req, res) => {
    const { name, description, revisions, project_key } = req.body;
    const cleanName = sanitizeProjectName(name);
    
    if (!cleanName) return res.status(400).json({ error: "Project name is required and must contain alphanumeric characters" });

    try {
        const finalProjectKey = project_key ? project_key.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) : await generateProjectKey(cleanName);
        db.run("INSERT INTO projects (name, description, revisions, project_key) VALUES (?, ?, ?, ?)", [cleanName, description, revisions, finalProjectKey], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    if (err.message.includes('projects.name')) {
                        return res.status(400).json({ error: `A project with the name "${cleanName}" already exists.` });
                    }
                    if (err.message.includes('projects.project_key')) {
                        return res.status(500).json({ error: "Failed to allocate unique project key. Try again." });
                    }
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, name: cleanName, project_key: finalProjectKey });
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
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

// Owners API
app.get('/api/owners', (req, res) => {
    db.all("SELECT * FROM owners", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/owners', (req, res) => {
    const { name } = req.body;
    db.run("INSERT INTO owners (name) VALUES (?)", [name], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name });
    });
});

// Tags API
app.get('/api/tags', (req, res) => {
    db.all("SELECT * FROM tags", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/tags', (req, res) => {
    const { name, color } = req.body;
    db.run("INSERT INTO tags (name, color) VALUES (?, ?)", [name, color], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, name });
    });
});

// Reworks API
app.get('/api/reworks', (req, res) => {
    const query = `
        SELECT reworks.*, pcbs.board_number 
        FROM reworks 
        LEFT JOIN pcbs ON reworks.pcb_id = pcbs.id
        ORDER BY timestamp DESC
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/reworks', (req, res) => {
    const { pcb_id, description, status } = req.body;
    const query = "INSERT INTO reworks (pcb_id, description, status) VALUES (?, ?, ?)";
    db.run(query, [pcb_id, description, status || 'Completed'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, pcb_id });
    });
});

// --- Projects API Expansions ---
app.put('/api/projects/:id', (req, res) => {
    const { name, description, revisions, project_key } = req.body;
    const cleanName = sanitizeProjectName(name);

    if (!cleanName) return res.status(400).json({ error: "Project name is required" });
    const finalProjectKey = project_key ? project_key.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2) : null;

    db.run("UPDATE projects SET name = ?, description = ?, revisions = ?, project_key = ? WHERE id = ?", [cleanName, description, revisions, finalProjectKey, req.params.id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                if (err.message.includes('projects.name')) {
                    return res.status(400).json({ error: `A project with the name "${cleanName}" already exists.` });
                }
                if (err.message.includes('projects.project_key')) {
                    return res.status(400).json({ error: `The project key "${finalProjectKey}" is already in use.` });
                }
            }
            return res.status(500).json({ error: err.message });
        }
        res.json({ updated: this.changes, name: cleanName });
    });
});

app.delete('/api/projects/:id', (req, res) => {
    db.run("DELETE FROM projects WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- PCBs API Expansions ---
app.get('/api/pcbs/:id', (req, res) => {
    db.get("SELECT * FROM pcbs WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.put('/api/pcbs/:id', (req, res) => {
    const { board_number, status, product_name_and_rev, project_id, owner_id } = req.body;
    const query = "UPDATE pcbs SET board_number = ?, status = ?, product_name_and_rev = ?, project_id = ?, owner_id = ? WHERE id = ?";
    db.run(query, [board_number, status, product_name_and_rev, project_id, owner_id, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

app.delete('/api/pcbs/:id', (req, res) => {
    db.run("DELETE FROM pcbs WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- Owners API Expansions ---
app.get('/api/owners/:id', (req, res) => {
    db.get("SELECT * FROM owners WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.put('/api/owners/:id', (req, res) => {
    const { name } = req.body;
    db.run("UPDATE owners SET name = ? WHERE id = ?", [name, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

app.delete('/api/owners/:id', (req, res) => {
    db.run("DELETE FROM owners WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- Tags API Expansions ---
app.get('/api/tags/:id', (req, res) => {
    db.get("SELECT * FROM tags WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.put('/api/tags/:id', (req, res) => {
    const { name, color } = req.body;
    db.run("UPDATE tags SET name = ?, color = ? WHERE id = ?", [name, color, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

app.delete('/api/tags/:id', (req, res) => {
    db.run("DELETE FROM tags WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// --- Reworks API Expansions ---
app.get('/api/reworks/:id', (req, res) => {
    db.get("SELECT * FROM reworks WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

app.put('/api/reworks/:id', (req, res) => {
    const { pcb_id, description, status } = req.body;
    db.run("UPDATE reworks SET pcb_id = ?, description = ?, status = ? WHERE id = ?", [pcb_id, description, status, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

app.delete('/api/reworks/:id', (req, res) => {
    db.run("DELETE FROM reworks WHERE id = ?", [req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// Start Server
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
});
