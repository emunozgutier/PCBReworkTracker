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
INSERT OR IGNORE INTO 'pcb_tags'(_rowid_, 'pcb_id', 'tag_id') VALUES (26, NULL, 'dead');
INSERT OR IGNORE INTO 'pcb_tags'(_rowid_, 'pcb_id', 'tag_id') VALUES (43, NULL, 'new-mdi');
INSERT OR IGNORE INTO 'pcb_tags'(_rowid_, 'pcb_id', 'tag_id') VALUES (67, NULL, 'verified-ok');
DELETE FROM sqlite_sequence;
INSERT OR IGNORE INTO 'sqlite_sequence'(_rowid_, 'name', 'seq') VALUES (NULL, 'dead', 26);
INSERT OR IGNORE INTO 'sqlite_sequence'(_rowid_, 'name', 'seq') VALUES (NULL, 'new-mdi', 43);
INSERT OR IGNORE INTO 'sqlite_sequence'(_rowid_, 'name', 'seq') VALUES (NULL, 'verified-ok', 67);
INSERT OR IGNORE INTO 'reworks'('id', 'pcb_id', 'title') VALUES (4, '506818', '2026-07-24T07:11:48.342Z');
CREATE TABLE lost_and_found(rootpgno INTEGER, pgno INTEGER, nfield INTEGER, id INTEGER, c0, c1, c2, c3, c4, c5, c6, c7);
INSERT INTO lost_and_found VALUES(2, 2, 8, 1, NULL, 'Pine', '', 'A0, B0, A1, A2, B1, C0, C1', 'PIN', 'TT, SS, FF', 'decimal', '2026-07-05 16:53:53');
INSERT INTO lost_and_found VALUES(2, 2, 8, 87, NULL, 'Ash', '', 'A0', 'ASH', 'TT', 'decimal', '2026-07-05 19:32:50');
INSERT INTO lost_and_found VALUES(3, 3, 2, NULL, 'ASH', 87, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(3, 3, 2, NULL, 'PIN', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(4, 4, 2, 1, 'projects', 884, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(4, 4, 2, 2, 'pcb_flavors', 311, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(4, 4, 2, 3, 'pcbs', 734, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(4, 4, 2, 4, 'owners', 236, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(4, 4, 2, 5, 'tags', 151, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(4, 4, 2, 6, 'reworks', 492, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(5, 5, 2, NULL, 'ASH', 87, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(5, 5, 2, NULL, 'PIN', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(6, 6, 2, NULL, 'Ash', 87, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(6, 6, 2, NULL, 'Pine', 1, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(7, 7, 5, 49, NULL, 87, 'SVB', '["1.0"]', '["BOM1","BOM2"]', NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(7, 7, 5, 144, NULL, 1, 'Demo', '["1.0"]', '["Bom1"]', NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(7, 7, 5, 145, NULL, 1, 'Chamber', '["1.0"]', '["BOM1"]', NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(7, 7, 5, 146, NULL, 1, 'SVB', '["1.0"]', '["BOM1","BOM2"]', NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(8, 8, 4, 23, NULL, 'Josef Solonga', 'josefs', 'josef@company.com', NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(8, 8, 5, 139, NULL, 'EduardoJ', 'eduardoj', 'localhost.paternity707@passmail.net', 1, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(8, 8, 5, 170, NULL, 'Eduardo Munoz-Gutierrez', 'eduardom', 'Eduardo@company.com', 1, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(8, 8, 5, 171, NULL, 'Eduardo', 'eduard', 'eduardo@company.com', 0, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(10, 10, 2, NULL, 'eduard', 171, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(10, 10, 2, NULL, 'eduardoj', 139, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(10, 10, 2, NULL, 'eduardom', 170, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(10, 10, 2, NULL, 'josefs', 23, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(20, 20, 2, NULL, 'Eduardo', 171, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(20, 20, 2, NULL, 'Eduardo Munoz-Gutierrez', 170, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(20, 20, 2, NULL, 'EduardoJ', 139, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(20, 20, 2, NULL, 'Josef Solonga', 23, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(25, 25, 3, 1, 'b8bf56c8-ecf2-4aa0-9713-84d39e070ffe', 'eduardo@company.com', '2026-07-30T08:44:54.331Z', NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(25, 25, 3, 2, '5c8f6ebe-0d6f-49f4-b089-2f97de382bab', 'localhost.paternity707@passmail.net', '2026-07-30T08:45:33.337Z', NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(26, 26, 2, NULL, '5c8f6ebe-0d6f-49f4-b089-2f97de382bab', 2, NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO lost_and_found VALUES(26, 26, 2, NULL, 'b8bf56c8-ecf2-4aa0-9713-84d39e070ffe', 1, NULL, NULL, NULL, NULL, NULL, NULL);
PRAGMA writable_schema = off;
COMMIT;
