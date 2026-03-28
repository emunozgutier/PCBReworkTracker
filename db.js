import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'pcb_tracker.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
    db.serialize(() => {
        db.run('PRAGMA foreign_keys = ON');
        
        // Projects Table
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            revisions TEXT,
            project_key TEXT UNIQUE,
            formfactors TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Migration: Add formfactors column if it doesn't exist
                db.run(`ALTER TABLE projects ADD COLUMN formfactors TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (projects.formfactors):', err.message);
                    }
                });
                // Migration: Add revisions column if it doesn't exist
                db.run(`ALTER TABLE projects ADD COLUMN revisions TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (projects.revisions):', err.message);
                    }
                });
                db.run(`ALTER TABLE projects ADD COLUMN project_key TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (projects.project_key):', err.message);
                    } else if (!err) {
                        // Populate existing
                        db.all("SELECT id, name FROM projects WHERE project_key IS NULL", [], (err, rows) => {
                            if (!err && rows) {
                                rows.forEach(row => {
                                    const key = (row.name.replace(/[^A-Za-z]/g, '').slice(0, 2).toUpperCase() + "XX").slice(0, 2);
                                    db.run("UPDATE projects SET project_key = ? WHERE id = ?", [key + row.id, row.id]);
                                });
                            }
                            db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_key ON projects(project_key)`);
                        });
                    } else {
                        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_key ON projects(project_key)`);
                    }
                });
                // Migration: Add unique index on project name
                db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name ON projects(name COLLATE NOCASE)`, (err) => {
                    if (err) console.error('Migration error (projects.name unique):', err.message);
                });
            }
        });

        // Owners Table
        db.run(`CREATE TABLE IF NOT EXISTS owners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE
        )`, (err) => {
            if (!err) {
                db.run(`ALTER TABLE owners ADD COLUMN username TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (owners.username):', err.message);
                    } else if (!err) {
                        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_owners_username ON owners(username)`);
                    }
                });
            }
        });

        // Tags Table
        db.run(`CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#818cf8',
            owner_id INTEGER REFERENCES owners(id)
        )`, (err) => {
            if (!err) {
                db.run(`ALTER TABLE tags ADD COLUMN owner_id INTEGER REFERENCES owners(id)`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (tags.owner_id):', err.message);
                    } else if (!err) {
                        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_owner_name ON tags(owner_id, name COLLATE NOCASE)`);
                    }
                });
            }
        });

        // PCBs Table
        db.run(`CREATE TABLE IF NOT EXISTS pcbs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_number TEXT NOT NULL,
            status TEXT DEFAULT 'In Progress',
            product_name_and_rev TEXT,
            project_id INTEGER,
            owner_id INTEGER,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (owner_id) REFERENCES owners (id)
        )`, (err) => {
            if (!err) {
                db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pcbs_project_board_nocase ON pcbs(project_id, board_number COLLATE NOCASE)`);
            }
        });

        // Reworks Table
        db.run(`CREATE TABLE IF NOT EXISTS reworks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pcb_id INTEGER,
            title TEXT,
            rework_name TEXT UNIQUE,
            description TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Completed',
            owner_id INTEGER,
            image_path TEXT,
            FOREIGN KEY (pcb_id) REFERENCES pcbs (id),
            FOREIGN KEY (owner_id) REFERENCES owners (id)
        )`, (err) => {
            if (!err) {
                db.run(`ALTER TABLE reworks ADD COLUMN title TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (reworks.title):', err.message);
                    }
                });
                db.run(`ALTER TABLE reworks ADD COLUMN rework_name TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (reworks.rework_name):', err.message);
                    } else if (!err) {
                        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reworks_name ON reworks(rework_name)`);
                    }
                });
                db.run(`ALTER TABLE reworks ADD COLUMN image_path TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (reworks.image_path):', err.message);
                    }
                });
                db.run(`ALTER TABLE reworks ADD COLUMN owner_id INTEGER REFERENCES owners(id)`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.error('Migration error (reworks.owner_id):', err.message);
                    }
                });
            }
        });

        // PCB_Tags Join Table
        db.run(`CREATE TABLE IF NOT EXISTS pcb_tags (
            pcb_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (pcb_id, tag_id),
            FOREIGN KEY (pcb_id) REFERENCES pcbs (id),
            FOREIGN KEY (tag_id) REFERENCES tags (id)
        )`);

        // Seed initial data if empty
        db.get("SELECT COUNT(*) as count FROM projects", (err, row) => {
            if (row && row.count === 0) {
                db.run("INSERT INTO projects (name, description) VALUES (?, ?)", 
                    ['Project Ares', 'Modern PCB tracking for Mars rover components']);
                db.run("INSERT INTO owners (name) VALUES (?)", ['John Doe']);
                db.run("INSERT INTO tags (name, color) VALUES (?, ?)", ['Urgent', '#ef4444']);
                db.run("INSERT INTO tags (name, color) VALUES (?, ?)", ['Validation', '#3b82f6']);
                
                db.run(`INSERT INTO pcbs (board_number, status, product_name_and_rev, project_id, owner_id) 
                    VALUES (?, ?, ?, ?, ?)`, ['ARES-001', 'In Progress', 'ARES-A.1', 1, 1]);
                db.run("INSERT INTO reworks (pcb_id, description) VALUES (?, ?)", [1, 'Replaced faulty capacitor C12']);
                db.run("INSERT INTO pcb_tags (pcb_id, tag_id) VALUES (?, ?)", [1, 1]);
            }
        });

        // Add Case-Insensitive Unique Indexes for all entities
        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_owners_name_nocase ON owners(name COLLATE NOCASE)`);
        db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_nocase ON tags(name COLLATE NOCASE)`);
    });
};

export { db, initDb };
