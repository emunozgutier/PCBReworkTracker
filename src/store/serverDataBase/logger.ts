import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Request, Response, NextFunction } from 'express';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, 'logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

interface ParsedUA {
    browser: string;
    os: string;
}

// Basic User-Agent parser (very lightweight)
const parseUserAgent = (ua: string | undefined): ParsedUA => {
    if (!ua) return { browser: 'Unknown', os: 'Unknown' };
    
    let browser = 'Unknown';
    if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Safari/')) browser = 'Safari';
    
    let os = 'Unknown';
    if (ua.includes('Windows NT 10.0')) os = 'Windows 10/11';
    else if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
    
    return { browser, os };
};

// Calculate week identifier in format YYYY_weekWW
const getWeekIdentifier = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const paddedWeek = String(weekNo).padStart(2, '0');
    return `${d.getUTCFullYear()}_week${paddedWeek}`;
};

// 60-day rotation cleanup for weekly logs
export const cleanupOldLogs = (): void => {
    try {
        const files = fs.readdirSync(logDir);
        const now = Date.now();
        const MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
        
        let deletedCount = 0;
        files.forEach(file => {
            if (file.startsWith('access-') && (
                file.endsWith('.db') || 
                file.endsWith('.db-wal') || 
                file.endsWith('.db-shm') || 
                file.endsWith('.log') || 
                file.endsWith('.csv')
            )) {
                const filePath = path.join(logDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > MAX_AGE_MS) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            }
        });
        if (deletedCount > 0) {
            console.log(`[Logger] Deleted ${deletedCount} log files/DBs older than 60 days.`);
        }
    } catch (err) {
        console.error('[Logger] Error cleaning up old logs:', err);
    }
};

// Start the cleanup interval (every 1 hour)
setInterval(cleanupOldLogs, 60 * 60 * 1000);

// Global connection state
let currentDb: sqlite3.Database | null = null;
let currentDbPath: string | null = null;
let isInitializing = false;
const pendingQueue: Array<{ resolve: (db: sqlite3.Database) => void; reject: (err: any) => void }> = [];

const getLogDb = (dbPath: string): Promise<sqlite3.Database> => {
    return new Promise((resolve, reject) => {
        if (currentDb && currentDbPath === dbPath) {
            return resolve(currentDb);
        }

        // If another request is currently initializing a new database, queue this request
        if (isInitializing) {
            pendingQueue.push({ resolve, reject });
            return;
        }

        isInitializing = true;

        const cleanupAndReject = (err: any, db?: sqlite3.Database) => {
            if (db) db.close();
            isInitializing = false;
            reject(err);
            while (pendingQueue.length > 0) {
                const next = pendingQueue.shift();
                if (next) next.reject(err);
            }
        };

        const initAndResolve = (db: sqlite3.Database) => {
            db.configure("busyTimeout", 10000);
            db.run(`CREATE TABLE IF NOT EXISTS access_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                ip TEXT,
                username TEXT,
                name TEXT,
                role TEXT,
                method TEXT,
                url TEXT,
                os TEXT,
                browser TEXT,
                statusCode INTEGER,
                durationMs INTEGER,
                requestBody TEXT,
                responseBody TEXT,
                error TEXT
            )`, (err) => {
                if (err) {
                    cleanupAndReject(err, db);
                } else {
                    if (currentDb) {
                        currentDb.close((closeErr) => {
                            if (closeErr) console.error('[Logger] Error closing old log DB:', closeErr);
                        });
                    }
                    currentDb = db;
                    currentDbPath = dbPath;
                    isInitializing = false;
                    resolve(db);
                    while (pendingQueue.length > 0) {
                        const next = pendingQueue.shift();
                        if (next) next.resolve(db);
                    }
                }
            });
        };

        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                cleanupAndReject(err);
            } else {
                initAndResolve(db);
            }
        });
    });
};

const serializeField = (val: any): string | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'object') {
        try {
            return JSON.stringify(val);
        } catch (e) {
            return String(val);
        }
    }
    return String(val);
};

export const apiLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    // Only log API data requests (ignore static picture fetches and GET requests)
    if (req.method === 'GET' || !req.path.startsWith('/api') || req.path.startsWith('/api/pictures')) {
        return next();
    }

    const startTime = Date.now();
    const { browser, os } = parseUserAgent(req.get('User-Agent'));
    
    // Intercept response
    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody: any = null;

    res.json = function (this: Response, body: any) {
        responseBody = body;
        return originalJson.call(this, body);
    } as any;

    res.send = function (this: Response, body: any) {
        if (!responseBody) responseBody = body; // capture if json wasn't called
        return originalSend.call(this, body);
    } as any;

    res.on('finish', async () => {
        const duration = Date.now() - startTime;
        const now = new Date();
        const weekId = getWeekIdentifier(now);
        const logDbPath = path.join(logDir, `access-${weekId}.db`);
        
        const username = req.headers['x-user-username'] || 'guest';
        const name = req.headers['x-user-name'] || 'Guest';
        const role = req.headers['x-user-role'] || 'Guest';

        const timestamp = now.toISOString();
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        try {
            const db = await getLogDb(logDbPath);
            db.run(
                `INSERT INTO access_logs (
                    timestamp, ip, username, name, role, method, url, os, browser, statusCode, durationMs, requestBody, responseBody, error
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    timestamp,
                    ip ? String(ip) : null,
                    username,
                    name,
                    role,
                    req.method,
                    req.originalUrl,
                    os,
                    browser,
                    res.statusCode,
                    duration,
                    serializeField(req.method !== 'GET' ? req.body : undefined),
                    serializeField(responseBody),
                    serializeField(res.statusCode >= 400 ? responseBody : undefined)
                ],
                (err) => {
                    if (err) {
                        console.error('[Logger] Failed to insert log entry into DB:', err);
                    }
                }
            );
        } catch (err) {
            console.error('[Logger] Failed to connect or initialize weekly log DB:', err);
        }
    });

    next();
};
