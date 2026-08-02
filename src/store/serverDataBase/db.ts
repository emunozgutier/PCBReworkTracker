import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'pcb_tracker.db');

let dbInstance: sqlite3.Database = new sqlite3.Database(dbPath);
dbInstance.configure("busyTimeout", 10000);

const db = {
    run: (sql: string, ...args: any[]): sqlite3.Database => (dbInstance.run as any)(sql, ...args),
    all: (sql: string, ...args: any[]): sqlite3.Database => (dbInstance.all as any)(sql, ...args),
    get: (sql: string, ...args: any[]): sqlite3.Database => (dbInstance.get as any)(sql, ...args),
    serialize: (callback?: () => void): void => dbInstance.serialize(callback),
    prepare: (sql: string, ...args: any[]): sqlite3.Statement => (dbInstance.prepare as any)(sql, ...args),
    close: (callback?: (err: Error | null) => void): void => dbInstance.close(callback)
};

const recreateDb = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        dbInstance.close((err) => {
            if (err && (err as any).code !== 'SQLITE_MISUSE') {
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
                dbInstance.configure("busyTimeout", 10000);
                resolve();
            });
        });
    });
};

const checkIntegrity = (): Promise<boolean> => {
    return new Promise((resolve) => {
        dbInstance.get('PRAGMA integrity_check;', (err: Error | null, row: any) => {
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

const initDb = async (): Promise<void> => {
    let isHealthy = await checkIntegrity();
    if (!isHealthy) {
        console.warn("Database corrupted or invalid. Recreating from scratch...");
        await recreateDb();
    }

    return new Promise<void>((resolve) => {
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
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by TEXT,
            updated_by TEXT
        )`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_key ON projects(project_key)`);
        dbInstance.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_name ON projects(name COLLATE NOCASE)`);

        // Project Docs Table & Legacy Migration
        dbInstance.run(`CREATE TABLE IF NOT EXISTS project_docs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            project_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            path TEXT NOT NULL,
            uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`);

        dbInstance.get("SELECT name FROM sqlite_master WHERE type='table' AND name='project_schematics'", (_err, row) => {
            if (row) {
                dbInstance.serialize(() => {
                    dbInstance.run("INSERT OR IGNORE INTO project_docs (id, project_id, filename, path, uploaded_at) SELECT id, project_id, filename, path, uploaded_at FROM project_schematics", () => {
                        dbInstance.run("DROP TABLE IF EXISTS project_schematics");
                    });
                });
            }
        });

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
            email TEXT,
            otp_secret TEXT,
            otp_reset_token TEXT,
            otp_reset_expires INTEGER,
            otp_reset_by TEXT,
            otp_reset_at TEXT,
            crc_format TEXT,
            login_attempts TEXT
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

        // Global Settings Table
        dbInstance.run(`CREATE TABLE IF NOT EXISTS global_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`);
        dbInstance.run(`INSERT OR IGNORE INTO global_settings (key, value) VALUES ('allowGuestMinorRework', 'true')`);
        dbInstance.run(`INSERT OR IGNORE INTO global_settings (key, value) VALUES ('priority_Silicon Swap', 'High')`);
        dbInstance.run(`INSERT OR IGNORE INTO global_settings (key, value) VALUES ('priority_Major Rework', 'High')`);
        dbInstance.run(`INSERT OR IGNORE INTO global_settings (key, value) VALUES ('priority_Minor Rework', 'Low')`);
        dbInstance.run(`INSERT OR IGNORE INTO global_settings (key, value) VALUES ('priority_Resistor Swap', 'Low')`);

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
            created_by TEXT,
            updated_by TEXT,
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
            created_by TEXT,
            updated_by TEXT,
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
        dbInstance.run(`ALTER TABLE projects ADD COLUMN number_format TEXT DEFAULT 'decimal'`, (_err: Error | null) => {
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
        // Migration: Add otp_secret column to owners if it doesn't exist
        dbInstance.run(`ALTER TABLE owners ADD COLUMN otp_secret TEXT`, () => {});
        // Migration: Add otp_reset columns to owners if they don't exist
        dbInstance.run(`ALTER TABLE owners ADD COLUMN otp_reset_token TEXT`, () => {});
        dbInstance.run(`ALTER TABLE owners ADD COLUMN otp_reset_expires INTEGER`, () => {});
        dbInstance.run(`ALTER TABLE owners ADD COLUMN otp_reset_by TEXT`, () => {});
        dbInstance.run(`ALTER TABLE owners ADD COLUMN otp_reset_at TEXT`, () => {});
        dbInstance.run(`ALTER TABLE owners ADD COLUMN crc_format TEXT`, () => {});
        // Migration: Add login_attempts column to owners if it doesn't exist
        dbInstance.run(`ALTER TABLE owners ADD COLUMN login_attempts TEXT`, () => {});
        
        // Migration: Add created_by and updated_by columns to tables if they don't exist
        dbInstance.run(`ALTER TABLE projects ADD COLUMN created_by TEXT`, () => {});
        dbInstance.run(`ALTER TABLE projects ADD COLUMN updated_by TEXT`, () => {});
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN created_by TEXT`, () => {});
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN updated_by TEXT`, () => {});
        dbInstance.run(`ALTER TABLE reworks ADD COLUMN created_by TEXT`, () => {});
        dbInstance.run(`ALTER TABLE reworks ADD COLUMN updated_by TEXT`, () => {});
        
        dbInstance.run(`ALTER TABLE pcbs ADD COLUMN created_at DATETIME`, (err: Error | null) => {
            if (err) {
                console.log("Migration created_at log:", err.message);
            } else {
                console.log("Migration created_at: successfully created column!");
            }
            dbInstance.run("UPDATE pcbs SET created_at = datetime('now') WHERE created_at IS NULL", (updateErr: Error | null) => {
                if (updateErr) {
                    console.log("Migration created_at update error:", updateErr.message);
                } else {
                    console.log("Migration created_at: successfully initialized null timestamps to now!");
                }
                
                dbInstance.get("SELECT COUNT(*) as count FROM projects", (_errCount, rowCount: any) => {
                    if (rowCount && rowCount.count === 0) {
                        console.log("Database projects table is empty. Checking for data.sql recovery...");
                        const sqlPath = path.resolve(__dirname, 'data.sql');
                        if (fs.existsSync(sqlPath)) {
                            console.log("Recovering database from data.sql...");
                            try {
                                const sqlContent = fs.readFileSync(sqlPath, 'utf8');
                                const cleanSql = sqlContent.split('\n')
                                    .filter(line => !line.trim().startsWith('.'))
                                    .join('\n')
                                    .replace(/CREATE TABLE /gi, 'CREATE TABLE IF NOT EXISTS ')
                                    .replace(/CREATE UNIQUE INDEX /gi, 'CREATE UNIQUE INDEX IF NOT EXISTS ');
                                
                                 dbInstance.run('PRAGMA foreign_keys = OFF', () => {
                                    dbInstance.exec(cleanSql, (execErr) => {
                                        if (execErr) {
                                            console.error("Error executing data.sql:", execErr);
                                        } else {
                                            console.log("data.sql loaded successfully. Running recovery queries...");
                                        }
                                        
                                        dbInstance.serialize(() => {
                                            dbInstance.run(`
                                                INSERT OR IGNORE INTO projects (id, name, description, revisions, project_key, silicon_corners, number_format, created_at)
                                                SELECT id, c1, c2, c3, c4, c5, c6, c7 FROM lost_and_found WHERE rootpgno = 2
                                            `, (errProj) => {
                                                if (errProj) console.error("Error recovering projects:", errProj.message);
                                                else console.log("Projects recovered successfully!");
                                            });

                                            dbInstance.run(`
                                                INSERT OR IGNORE INTO owners (id, name, username, email)
                                                SELECT id, c1, c2, c3 FROM lost_and_found WHERE rootpgno = 8
                                            `, (errOwn) => {
                                                if (errOwn) console.error("Error recovering owners:", errOwn.message);
                                                else console.log("Owners recovered successfully!");
                                            });

                                            dbInstance.run(`
                                                INSERT OR IGNORE INTO pcb_flavors (id, project_id, name, revisions, boms)
                                                SELECT id, c1, c2, c3, c4 FROM lost_and_found WHERE rootpgno = 7
                                            `, (errFlav) => {
                                                if (errFlav) console.error("Error recovering pcb_flavors:", errFlav.message);
                                                else console.log("PCB Flavors recovered successfully!");
                                                
                                                dbInstance.run('PRAGMA foreign_keys = ON', () => {
                                                    resolve();
                                                });
                                            });
                                        });
                                    });
                                });
                            } catch (e: any) {
                                console.error("Failed to recover data from data.sql:", e.message);
                                resolve();
                            }
                        } else {
                            resolve();
                        }
                    } else {
                        resolve();
                    }
                });
            });
        });
    });
});
};

export { db, initDb };
