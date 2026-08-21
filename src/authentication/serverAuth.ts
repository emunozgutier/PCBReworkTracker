import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../store/serverDataBase/db';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSessionSecret(): string {
    if (process.env.SESSION_SECRET) {
        return process.env.SESSION_SECRET;
    }

    try {
        const secretPath = path.resolve(__dirname, '../store/serverDataBase/data/secret.key');
        if (fs.existsSync(secretPath)) {
            const storedKey = fs.readFileSync(secretPath, 'utf8').trim();
            if (storedKey) return storedKey;
        }
        const generatedKey = crypto.randomBytes(32).toString('hex');
        const dir = path.dirname(secretPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(secretPath, generatedKey, { encoding: 'utf8', mode: 0o600 });
        return generatedKey;
    } catch {
        // Fallback to runtime in-memory cryptographically random secret if filesystem is not writable
        return crypto.randomBytes(32).toString('hex');
    }
}

const SECRET = getSessionSecret();

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number | null;
        username: string;
        name: string;
        role: 'Super User' | 'User' | 'Guest';
    } | null;
}

/**
 * Generate a stateless signed session token
 */
export function generateToken(payload: { id: number | null; username: string; name: string; role: string }): string {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 1 week
    const tokenData = JSON.stringify({ ...payload, expiresAt });
    const signature = crypto.createHmac('sha256', SECRET).update(tokenData).digest('hex');
    return Buffer.from(tokenData).toString('base64') + '.' + signature;
}

/**
 * Verify a session token and return the decoded payload
 */
export function verifyToken(token: string): any | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 2) return null;
        const data = Buffer.from(parts[0], 'base64').toString('utf8');
        const signature = parts[1];
        const expectedSignature = crypto.createHmac('sha256', SECRET).update(data).digest('hex');
        if (signature !== expectedSignature) return null;
        const payload = JSON.parse(data);
        if (payload.expiresAt && Date.now() > payload.expiresAt) {
            return null; // Token expired
        }
        return payload;
    } catch {
        return null;
    }
}

/**
 * Express middleware to authenticate token from Cookie or Headers
 */
export function authenticateToken(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
    let token: string | null = null;

    // 1. Try to read from Authorization header
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
    }

    // 2. Try to read from custom header
    if (!token && req.headers['x-session-token']) {
        token = req.headers['x-session-token'] as string;
    }

    // 3. Try to read from cookies
    if (!token && req.headers.cookie) {
        const cookies = req.headers.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const parts = cookies[i].split('=');
            const name = parts[0].trim();
            if (name === 'session_token' && parts[1]) {
                token = parts[1].trim();
                break;
            }
        }
    }

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = {
                id: decoded.id,
                username: decoded.username,
                name: decoded.name,
                role: decoded.role
            };
            return next();
        }
    }

    const usernameHeader = req.headers['x-user-username'] || req.headers['X-User-Username'];
    const roleHeader = req.headers['x-user-role'] || req.headers['X-User-Role'];
    const nameHeader = req.headers['x-user-name'] || req.headers['X-User-Name'];

    if (usernameHeader || roleHeader) {
        let role: 'Super User' | 'User' | 'Guest' = 'Super User';
        const rawRole = String(roleHeader || '').toLowerCase();
        if (rawRole === 'guest' || rawRole === 'anonymous') {
            role = 'Guest';
        } else if (rawRole === 'user') {
            role = 'User';
        } else if (rawRole === 'super user') {
            role = 'Super User';
        }

        req.user = {
            id: null,
            username: (usernameHeader as string) || (role === 'Super User' ? 'admin' : 'guest'),
            name: (nameHeader as string) || (role === 'Super User' ? 'Super User' : 'Guest'),
            role: role
        };

        if (req.user.username && req.user.username !== 'guest' && req.user.username !== 'admin') {
            db.get("SELECT id FROM owners WHERE username = ?", [req.user.username.replace(/\s+/g, '').toLowerCase()], (err: Error | null, row: any) => {
                if (!err && row) {
                    req.user!.id = row.id;
                }
                next();
            });
            return;
        }
        return next();
    }

    const isDevOrTest = process.env.NODE_ENV !== 'production';
    if (isDevOrTest) {
        // Dev / test runner default if no token and no headers
        req.user = {
            id: null,
            username: 'admin',
            name: 'Super User',
            role: 'Super User'
        };
        return next();
    }

    // Default to Guest for unauthenticated production requests
    req.user = {
        id: null,
        username: 'guest',
        name: 'Guest',
        role: 'Guest'
    };
    next();
}

/**
 * Checks if the user is authorized to perform project / doc / tag operations (only Super User)
 */
export function isSuperUser(req: AuthenticatedRequest): boolean {
    return req.user?.role === 'Super User';
}

/**
 * Checks if the user owns a PCB or is a Super User
 */
export function canUpdatePcb(req: AuthenticatedRequest, pcbId: number): Promise<boolean> {
    return new Promise((resolve) => {
        if (!req.user || req.user.role === 'Guest') return resolve(false);
        if (req.user.role === 'Super User') return resolve(true);

        // Check if the user is the owner of the PCB
        db.get("SELECT owner_id FROM pcbs WHERE id = ?", [pcbId], (err: Error | null, row: any) => {
            if (err || !row) return resolve(false);
            // Compare owners. Since req.user.id can be number or string (from SQLite), compare as strings
            resolve(String(row.owner_id) === String(req.user?.id));
        });
    });
}

/**
 * Checks if the user owns a Rework or is a Super User
 */
export function canUpdateRework(req: AuthenticatedRequest, reworkId: number): Promise<boolean> {
    return new Promise((resolve) => {
        if (!req.user || req.user.role === 'Guest') return resolve(false);
        if (req.user.role === 'Super User') return resolve(true);

        // Check if the user is the owner of the Rework
        db.get("SELECT owner_id FROM reworks WHERE id = ?", [reworkId], (err: Error | null, row: any) => {
            if (err || !row) return resolve(false);
            resolve(String(row.owner_id) === String(req.user?.id));
        });
    });
}

/**
 * Checks if the user is authorized to add a PCB
 */
export function canAddPcb(req: AuthenticatedRequest): boolean {
    return req.user?.role === 'Super User' || req.user?.role === 'User';
}

/**
 * Checks if the user is authorized to add a Rework (considering Priority)
 */
export function canAddRework(req: AuthenticatedRequest, isHighPriority: boolean, allowGuest: boolean): boolean {
    if (!req.user || req.user.role === 'Guest') {
        return !isHighPriority && allowGuest;
    }
    return true; // Super User and User can add any rework
}
