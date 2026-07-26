import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'pcb_tracker.db');

let dbInstance = new sqlite3.Database(dbPath);

const db = {
    run: (...args) => dbInstance.run(...args),
    all: (...args) => dbInstance.all(...args),
    get: (...args) => dbInstance.get(...args),
    serialize: (...args) => dbInstance.serialize(...args),
    close: (...args) => dbInstance.close(...args)
};

const recreateDb = () => {
    return new Promise((resolve, reject) => {
        dbInstance.close((err) => {
            if (err && err.code !== 'SQLITE_MISUSE') {
                console.error("Error closing corrupted DB:", err);
            }
            try {
                if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
                if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
                if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
            } catch (e) {
                console.error("Error deleting DB files:", e);
            }
            dbInstance = new sqlite3.Database(dbPath, (err) => {
                if (err) return reject(err);
                resolve();
            });
        });
    });
};

const checkIntegrity = () => {
    return new Promise((resolve) => {
        dbInstance.get('PRAGMA integrity_check;', (err, row) => {
            if (err) {
                return resolve(false);
            }
            if (row && row.integrity_check === 'ok') {
                return resolve(true);
            }
            resolve(false);
        });
    });
};

const initDb = async () => {
    let isHealthy = await checkIntegrity();
    if (!isHealthy) {
        console.warn("Database corrupted or invalid. Recreating from scratch...");
        await recreateDb();
    }

    return new Promise((resolve, reject) => {
        dbInstance.serialize(() => {
            dbInstance.run('PRAGMA foreign_keys = ON');
        
        // Projects Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            revisions TEXT,
            project_key TEXT UNIQUE,
            silicon_corners TEXT,
            number_format TEXT DEFAULT 'decimal',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_key ON projects(project_key)`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name ON projects(name COLLATE NOCASE)`);

        // PCB Flavors Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS pcb_flavors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            revisions TEXT,
            boms TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`);

        // Owners Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS owners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE,
            email TEXT
        )`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_owners_username ON owners(username)`);

        // Tags Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            color TEXT DEFAULT '#818cf8',
            owner_id INTEGER REFERENCES owners(id),
            type TEXT DEFAULT 'public'
        )`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_owner_name ON tags(owner_id, name COLLATE NOCASE)`);

        // PCBs Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS pcbs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            board_number TEXT NOT NULL,
            status TEXT DEFAULT 'In Progress',
            board_flavor TEXT,
            board_rev TEXT,
            silicon_rev TEXT,
            silicon_corner TEXT,
            bom TEXT,
            project_id INTEGER,
            owner_id INTEGER,
            short_code TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects (id),
            FOREIGN KEY (owner_id) REFERENCES owners (id)
        )`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_pcbs_project_board_nocase ON pcbs(project_id, board_number COLLATE NOCASE)`);

        // Reworks Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS reworks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pcb_id INTEGER,
            title TEXT,
            rework_number INTEGER,
            description TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Completed',
            owner_id INTEGER,
            image_path TEXT,
            rework_type TEXT DEFAULT 'Minor',
            FOREIGN KEY (pcb_id) REFERENCES pcbs (id),
            FOREIGN KEY (owner_id) REFERENCES owners (id)
        )`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_reworks_pcb_num ON reworks(pcb_id, rework_number)`);

        // PCB_Tags Join Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS pcb_tags (
            pcb_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (pcb_id, tag_id),
            FOREIGN KEY (pcb_id) REFERENCES pcbs (id),
            FOREIGN KEY (tag_id) REFERENCES tags (id)
        )`);

        // Add Case-Insensitive Unique Indexes for all entities
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_owners_name_nocase ON owners(name COLLATE NOCASE)`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name_nocase ON tags(name COLLATE NOCASE)`);

        // Migration: Add number_format column to projects if it doesn't exist
        dbInstance.run(`ALTER TABLE projects ADD COLUMN number_format TEXT DEFAULT 'decimal'`, (err) => {
            // Ignore error if column already exists
        });

        // Migration: Add new split columns to pcbs if they don't exist
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN board_flavor TEXT`, () => {});
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN board_rev TEXT`, () => {});
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN silicon_rev TEXT`, () => {});
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN silicon_corner TEXT`, () => {});
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN short_code TEXT`, () => {});
        
        // Migration: Add email column to owners if it doesn't exist
        dbInstance.run(`ALTER TABLE owners ADD COLUMN email TEXT`, () => {});
        
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN created_at DATETIME`, (err) => {
            if (err) {
                console.log("Migration created_at log:", err.message);
            } else {
                console.log("Migration created_at: successfully created column!");
            }
            dbInstance.run("UPDATE pcbs SET created_at = datetime('now') WHERE created_at IS NULL", (updateErr) => {
                if (updateErr) {
                    console.log("Migration created_at update error:", updateErr.message);
                } else {
                    console.log("Migration created_at: successfully initialized null timestamps to now!");
                }
                resolve();
            });
        });
    });
});
};

export { db, initDb };
