import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.resolve(__dirname, '../src/store/serverDataBase/logs');

const API_URL = 'http://localhost:5002/api';

const getWeekIdentifier = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const paddedWeek = String(weekNo).padStart(2, '0');
    return `${d.getUTCFullYear()}_week${paddedWeek}`;
};

describe('API Logging SQLite DB Tests', () => {

    it('should log API requests into the weekly SQLite database', async () => {
        const uniqueHeaderVal = `vitest_logger_user_${Date.now()}`;
        const uniqueProjectName = `LoggerTestProj_${Date.now()}`;
        
        // Trigger an API request that will be logged (POST requests are logged, GET are not)
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Username': uniqueHeaderVal,
                'X-User-Name': 'Logger Test User',
                'X-User-Role': 'Tester'
            },
            body: JSON.stringify({
                name: uniqueProjectName,
                description: 'Logger Test Project',
                revisions: 'A,B',
                flavors: []
            })
        });
        expect(res.status).toBe(201);

        // Sleep to allow the Express 'finish' handler to complete database insertion asynchronously
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Construct current week DB path
        const weekId = getWeekIdentifier(new Date());
        const dbPath = path.join(logDir, `access-${weekId}.db`);

        expect(fs.existsSync(dbPath)).toBe(true);

        // Query the database to verify the log record exists
        const db = new sqlite3.Database(dbPath);
        
        const logs: any[] = await new Promise((resolve, reject) => {
            db.all("SELECT * FROM access_logs WHERE username = ?", [uniqueHeaderVal], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        db.close();

        expect(logs.length).toBeGreaterThanOrEqual(1);
        const logEntry = logs[0];
        
        expect(logEntry.method).toBe('POST');
        expect(logEntry.url).toContain('/api/projects');
        expect(logEntry.username).toBe(uniqueHeaderVal);
        expect(logEntry.name).toBe('Logger Test User');
        expect(logEntry.role).toBe('Tester');
        expect(logEntry.statusCode).toBe(201);
        expect(logEntry.timestamp).toBeDefined();
        expect(logEntry.durationMs).toBeDefined();
    });

    it('should not log GET API requests into the weekly SQLite database', async () => {
        const uniqueHeaderVal = `vitest_logger_user_get_${Date.now()}`;
        
        // Trigger a GET API request
        const res = await fetch(`${API_URL}/projects`, {
            headers: {
                'X-User-Username': uniqueHeaderVal,
                'X-User-Name': 'Logger Test User',
                'X-User-Role': 'Tester'
            }
        });
        expect(res.status).toBe(200);

        // Sleep to allow the Express finish handler to run if it were to run
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Construct current week DB path
        const weekId = getWeekIdentifier(new Date());
        const dbPath = path.join(logDir, `access-${weekId}.db`);

        if (fs.existsSync(dbPath)) {
            const db = new sqlite3.Database(dbPath);
            const logs: any[] = await new Promise((resolve, reject) => {
                db.all("SELECT * FROM access_logs WHERE username = ?", [uniqueHeaderVal], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
            db.close();
            expect(logs.length).toBe(0);
        }
    });
});
