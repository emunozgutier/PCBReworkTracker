import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { cleanupTestData } from './cleanup';
import { getDbPath } from '../src/store/serverDataBase/db';

const API_URL = 'http://localhost:5002/api';

describe('Database Settings, Backup & Test Mode API', () => {
    beforeAll(async () => {
        await cleanupTestData();
    });

    afterAll(async () => {
        // Reset back to demo or clean mode
        await fetch(`${API_URL}/db/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Super User' },
            body: JSON.stringify({ mode: 'demo' })
        });
        await cleanupTestData();
    });

    it('should ensure testing uses an isolated test database (pcb_tracker_test.db) and NOT production', () => {
        const activePath = getDbPath();
        expect(activePath).toContain('pcb_tracker_test.db');
        expect(activePath).not.toBe(path.resolve(__dirname, '../src/store/serverDataBase/data/pcb_tracker.db'));
    });

    it('should retrieve current DB settings and backup list', async () => {
        const res = await fetch(`${API_URL}/db/settings`);
        expect(res.status).toBe(200);
        const data = await res.json();

        expect(data).toHaveProperty('backup_path');
        expect(data).toHaveProperty('default_backup_path');
        expect(data).toHaveProperty('current_mode');
        expect(data).toHaveProperty('backups');
        expect(Array.isArray(data.backups)).toBe(true);
    });

    it('should update backup folder path setting', async () => {
        const customPath = path.resolve(process.cwd(), 'tests', 'temp_test_files', 'custom_backups');
        const res = await fetch(`${API_URL}/db/settings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Super User' },
            body: JSON.stringify({ backup_path: customPath })
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.backup_path).toBe(customPath);

        // Verify retrieval reflects the new path
        const getRes = await fetch(`${API_URL}/db/settings`);
        const getData = await getRes.json();
        expect(getData.backup_path).toBe(customPath);
    });

    it('should create an instant database backup snapshot', async () => {
        const res = await fetch(`${API_URL}/db/backup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Super User' },
            body: JSON.stringify({})
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.backup).toBeDefined();
        expect(data.backup.filename).toContain('pcb_tracker_backup_');
        expect(data.backup.size).toBeGreaterThan(0);
        expect(fs.existsSync(data.backup.path)).toBe(true);

        // Clean up created backup file
        try {
            fs.unlinkSync(data.backup.path);
        } catch { /* ignore */ }
    });

    it('should switch database mode to empty and clear projects/pcbs', async () => {
        const res = await fetch(`${API_URL}/db/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Super User' },
            body: JSON.stringify({ mode: 'empty' })
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.mode).toBe('empty');

        // Verify projects are empty
        const projRes = await fetch(`${API_URL}/projects`);
        const projects = await projRes.json();
        expect(projects.length).toBe(0);

        // Verify PCBs are empty
        const pcbRes = await fetch(`${API_URL}/pcbs`);
        const pcbs = await pcbRes.json();
        expect(pcbs.length).toBe(0);
    });

    it('should switch database mode to demo and populate demo dataset', async () => {
        const res = await fetch(`${API_URL}/db/mode`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-User-Role': 'Super User' },
            body: JSON.stringify({ mode: 'demo' })
        });
        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data.success).toBe(true);
        expect(data.mode).toBe('demo');

        // Verify demo projects (Dione, Titan, Atlas) exist
        const projRes = await fetch(`${API_URL}/projects`);
        const projects = await projRes.json();
        expect(projects.length).toBeGreaterThanOrEqual(3);
        const dione = projects.find((p: any) => p.name === 'Dione');
        expect(dione).toBeDefined();
        expect(dione.packages).toBeDefined();
        expect(dione.packages.length).toBeGreaterThan(0);

        // Verify demo PCBs exist
        const pcbRes = await fetch(`${API_URL}/pcbs`);
        const pcbs = await pcbRes.json();
        expect(pcbs.length).toBeGreaterThanOrEqual(10);
    });
});
