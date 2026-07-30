import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanupTestData } from './cleanup';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = 'http://localhost:5002/api';
const dbPath = path.resolve(__dirname, '../src/store/serverDataBase/pcb_tracker.db');

function getDbConnection() {
    return new sqlite3.Database(dbPath);
}

function updateLoginAttempts(username: string, attempts: any[]): Promise<void> {
    return new Promise((resolve, reject) => {
        const db = getDbConnection();
        const cleanUsername = username.replace(/\s+/g, '').toLowerCase();
        db.run(
            "UPDATE owners SET login_attempts = ? WHERE username = ?",
            [JSON.stringify(attempts), cleanUsername],
            (err) => {
                db.close((closeErr) => {
                    if (err || closeErr) reject(err || closeErr);
                    else resolve();
                });
            }
        );
    });
}

function base32ToBuf(base32: string) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const clean = base32.replace(/=+$/, '').toUpperCase();
    const length = clean.length;
    let bits = 0;
    let value = 0;
    let index = 0;
    const buf = Buffer.alloc(Math.floor(length * 5 / 8));
    
    for (let i = 0; i < length; i++) {
        const val = alphabet.indexOf(clean[i]);
        if (val === -1) throw new Error("Invalid base32 character");
        value = (value << 5) | val;
        bits += 5;
        if (bits >= 8) {
            buf[index++] = (value >> (bits - 8)) & 255;
            bits -= 8;
        }
    }
    return buf;
}

function generateTotp(secret: string, time = Date.now()) {
    const counter = Math.floor(time / 1000 / 30);
    const key = base32ToBuf(secret);
    
    const countBuf = Buffer.alloc(8);
    let tmp = counter;
    for (let i = 7; i >= 0; i--) {
        countBuf[i] = tmp & 0xff;
        tmp = Math.floor(tmp / 256);
    }
    
    const hmac = crypto.createHmac('sha1', key).update(countBuf).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code = ((hmac[offset] & 0x7f) << 24) |
                 ((hmac[offset + 1] & 0xff) << 16) |
                 ((hmac[offset + 2] & 0xff) << 8) |
                 (hmac[offset + 3] & 0xff);
                 
    return String(code % 1000000).padStart(6, '0');
}

describe('Login Lockout Policy API Tests', () => {
    const uniqueUsername = `vitest_lockout_user_${Date.now()}`;
    let secret = '';

    beforeAll(async () => {
        // Setup OTP for the user first
        const resSetup = await fetch(`${API_URL}/otp/setup?username=${uniqueUsername}`);
        const setupData = await resSetup.json();
        secret = setupData.secret;

        // Create the owner
        const resCreate = await fetch(`${API_URL}/owners`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Role': 'Guest'
            },
            body: JSON.stringify({
                name: `Vitest Lockout User`,
                username: uniqueUsername,
                otp_secret: secret
            })
        });
        const createdUser = await resCreate.json();
        expect(createdUser.id).toBeDefined();
    });

    afterAll(async () => {
        try {
            await cleanupTestData();
        } catch (e) {
            console.error('Failed to run database cleanup:', e);
        }
    });

    it('should successfully log in with a valid OTP code', async () => {
        const token = generateTotp(secret);
        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token, username: uniqueUsername })
        });
        expect(resVerify.status).toBe(200);
        const data = await resVerify.json();
        expect(data.valid).toBe(true);
    });

    it('should fail verification with invalid OTP code and not trigger lockout on first two failures', async () => {
        // Attempt 1: Failed
        const resVerify1 = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token: '000000', username: uniqueUsername })
        });
        expect(resVerify1.status).toBe(400);
        const data1 = await resVerify1.json();
        expect(data1.valid).toBe(false);
        expect(data1.error).toContain('Invalid 6-digit verification code');

        // Attempt 2: Failed
        const resVerify2 = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token: '111111', username: uniqueUsername })
        });
        expect(resVerify2.status).toBe(400);
        const data2 = await resVerify2.json();
        expect(data2.valid).toBe(false);
    });

    it('should lockout the user on the 3rd failed login attempt within 15 minutes', async () => {
        // Attempt 3: Failed
        const resVerify3 = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token: '222222', username: uniqueUsername })
        });
        const data3 = await resVerify3.json();
        console.log("Attempt 3 status:", resVerify3.status, "data:", data3);
        expect(resVerify3.status).toBe(403);
        expect(data3.valid).toBe(false);
        expect(data3.error).toContain('locked for 30 minutes due to 3 failed login attempts');

        // Attempt 4: Should immediately reject with 403 Forbidden even with correct token
        const token = generateTotp(secret);
        const resVerify4 = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token, username: uniqueUsername })
        });
        const data4 = await resVerify4.json();
        console.log("Attempt 4 status:", resVerify4.status, "data:", data4);
        expect(resVerify4.status).toBe(403);
        expect(data4.error).toContain('locked');
    });

    it('should not lock out user if the 3 failed attempts span more than 15 minutes', async () => {
        // We modify the DB attempts to span 20 minutes (T1 = now - 20m, T2 = now - 10m, T3 = now - 5m)
        const now = Date.now();
        const spacedAttempts = [
            { timestamp: now - 20 * 60 * 1000, success: false },
            { timestamp: now - 10 * 60 * 1000, success: false }
        ];
        await updateLoginAttempts(uniqueUsername, spacedAttempts);

        // Third attempt now:
        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token: '333333', username: uniqueUsername })
        });
        
        // This is a 400 Bad Request, NOT a 403 lockout, because T3 - T1 = 20 minutes (> 15 minutes)
        expect(resVerify.status).toBe(400);
        const data = await resVerify.json();
        expect(data.error).toContain('Invalid 6-digit verification code');
    });

    it('should lift lockout automatically after 30 minutes', async () => {
        // We mock the DB to have 3 failures within 15 minutes, but the last failure was 35 minutes ago
        const now = Date.now();
        const expiredLockoutAttempts = [
            { timestamp: now - 45 * 60 * 1000, success: false },
            { timestamp: now - 40 * 60 * 1000, success: false },
            { timestamp: now - 35 * 60 * 1000, success: false }
        ];
        await updateLoginAttempts(uniqueUsername, expiredLockoutAttempts);

        // Attempting to log in now with a valid token should succeed
        const token = generateTotp(secret);
        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token, username: uniqueUsername })
        });
        expect(resVerify.status).toBe(200);
        const data = await resVerify.json();
        expect(data.valid).toBe(true);
    });
});
