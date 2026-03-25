import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'pcb_tracker.db');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
    db.serialize(() => {
        // Projects Table
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Owners Table
        db.run(`CREATE TABLE IF NOT EXISTS owners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )`);

        // Tags Table
        db.run(`CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT '#818cf8'
        )`);

        // PCBs Table
        db.run(`CREATE TABLE IF NOT EXISTS pcbs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_number TEXT NOT NULL UNIQUE,
            status TEXT DEFAULT 'In Progress',
            product_name_and_rev TEXT,
            project_id INTEGER,
            owner_id INTEGER,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (owner_id) REFERENCES owners (id)
        )`);

        // Reworks Table
        db.run(`CREATE TABLE IF NOT EXISTS reworks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pcb_id INTEGER,
            description TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Completed',
            FOREIGN KEY (pcb_id) REFERENCES pcbs (id)
        )`);

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
    });
};

export { db, initDb };
