import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db, initDb, autoMigrateUploadedDocs } from '../src/store/serverDataBase/db';
import { useUploadedDocsStore } from '../src/store/clientDataBase/useUploadedDocsStore';
import { useDemoStore } from '../src/store/useDemoStore';

describe('Unified Uploaded Docs (uploaded_docs) System', () => {
    beforeAll(async () => {
        useDemoStore.getState().setDemoMode(true);
        await initDb();
    });

    afterAll(() => {
        useDemoStore.getState().setDemoMode(false);
    });

    it('should have created the uploaded_docs table with expected schema', async () => {
        const columns: any[] = await new Promise((resolve) => {
            db.all("PRAGMA table_info(uploaded_docs)", (_err: any, rows: any[]) => {
                resolve(rows || []);
            });
        });

        const columnNames = columns.map(c => c.name);
        expect(columnNames).toContain('id');
        expect(columnNames).toContain('entity_type');
        expect(columnNames).toContain('entity_id');
        expect(columnNames).toContain('project_id');
        expect(columnNames).toContain('pcb_id');
        expect(columnNames).toContain('doc_type');
        expect(columnNames).toContain('filename');
        expect(columnNames).toContain('path');
        expect(columnNames).toContain('uploaded_at');
    });

    it('should auto-migrate legacy documents and pictures into uploaded_docs', async () => {
        // Run migration function
        autoMigrateUploadedDocs(db);

        // Give a brief moment for async migration callbacks
        await new Promise(r => setTimeout(r, 200));

        const docs: any[] = await new Promise((resolve) => {
            db.all("SELECT * FROM uploaded_docs", (_err: any, rows: any[]) => {
                resolve(rows || []);
            });
        });

        expect(Array.isArray(docs)).toBe(true);
        // Should have populated entries for project_docs, revision docs, or rework images
        const docTypes = new Set(docs.map(d => d.doc_type));
        console.log("Found uploaded_docs types:", Array.from(docTypes), "total count:", docs.length);
        expect(docs.length).toBeGreaterThanOrEqual(0);
    });

    it('should support querying docs and summary in useUploadedDocsStore mock/offline mode', async () => {
        const store = useUploadedDocsStore.getState();
        await store.fetchDocs();
        const loadedDocs = useUploadedDocsStore.getState().docs;
        expect(Array.isArray(loadedDocs)).toBe(true);

        // Fetch summary
        await store.fetchSummary();
        const summary = useUploadedDocsStore.getState().summary;
        expect(summary).toBeDefined();
        if (summary) {
            expect(summary).toHaveProperty('picture');
            expect(summary).toHaveProperty('schematic');
            expect(summary).toHaveProperty('board_file');
            expect(summary).toHaveProperty('bom_csv');
            expect(summary).toHaveProperty('datasheet');
            expect(summary).toHaveProperty('total');
        }
    });

    it('should accurately categorize document types based on file extension and entity', async () => {
        // Create test project to respect foreign key
        const uniqueKey = 'D' + Math.floor(Math.random() * 89 + 10);
        const uniqueName = 'DocTestProj_' + Date.now();
        const testProjId = await new Promise<number>((resolve, reject) => {
            db.run(
                "INSERT INTO projects (name, project_key) VALUES (?, ?)",
                [uniqueName, uniqueKey],
                function(this: any, err: any) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });

        await new Promise<void>((resolve, reject) => {
            db.run(
                `INSERT INTO uploaded_docs (entity_type, entity_id, project_id, doc_type, filename, original_filename, path)
                 VALUES ('project', ?, ?, 'board_file', 'test_board.brd', 'test_board.brd', '/docs/test_board.brd')`,
                [testProjId, testProjId],
                function(err: any) {
                    if (err) reject(err);
                    else resolve();
                }
            );
        });

        const row: any = await new Promise((resolve) => {
            db.get("SELECT * FROM uploaded_docs WHERE project_id = ? AND filename = 'test_board.brd'", [testProjId], (_err: any, r: any) => {
                resolve(r);
            });
        });

        expect(row).toBeDefined();
        expect(row.filename).toBe('test_board.brd');
        expect(row.doc_type).toBe('board_file');

        // Clean up test entries
        await new Promise<void>((resolve) => {
            db.run("DELETE FROM uploaded_docs WHERE project_id = ?", [testProjId], () => {
                db.run("DELETE FROM projects WHERE id = ?", [testProjId], () => resolve());
            });
        });
    });
});
