.dbconfig defensive off
BEGIN;
PRAGMA writable_schema = on;
PRAGMA foreign_keys = off;
PRAGMA encoding = 'UTF-8';
PRAGMA page_size = '4096';
PRAGMA auto_vacuum = '0';
PRAGMA user_version = '0';
PRAGMA application_id = '0';

CREATE TABLE pcb_tags (
    pcb_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (pcb_id, tag_id),
    FOREIGN KEY (pcb_id) REFERENCES pcbs (id),
    FOREIGN KEY (tag_id) REFERENCES tags (id)
);

CREATE TABLE pcb_flavors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    revisions TEXT,
    boms TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE "reworks" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pcb_id INTEGER,
    title TEXT,
    rework_number INTEGER,
    description TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT "Completed",
    owner_id INTEGER,
    image_path TEXT,
    rework_type TEXT DEFAULT "Minor",
    FOREIGN KEY (pcb_id) REFERENCES pcbs (id),
    FOREIGN KEY (owner_id) REFERENCES owners (id)
);

CREATE UNIQUE INDEX idx_reworks_pcb_num ON reworks(pcb_id, rework_number);

PRAGMA writable_schema = off;
COMMIT;
