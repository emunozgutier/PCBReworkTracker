import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { cleanupTestData } from './cleanup';
import crypto from 'crypto';
import request from 'supertest';

function base32ToBuf(base32) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let clean = base32.replace(/=+$/, '').toUpperCase();
    let length = clean.length;
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

function generateTotp(secret, time = Date.now()) {
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

// Assuming server is running on localhost:5002, or we could just use a fetch test
// Let's use standard fetch to hit the running dev server on localhost:5002

const API_URL = 'http://localhost:5002/api';

describe('Projects API - Silicon Version', () => {
    let projectId;

    it('should create a test project', async () => {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Project Dione',
                description: 'Test',
                revisions: 'A0',
                project_key: 'DIO',
                number_format: 'decimal',
                flavors: []
            })
        });
        const data = await res.json();
        expect(res.status).toBe(201);
        projectId = data.id;
        expect(projectId).toBeDefined();
    });

    it('should update the project by adding B0 silicon version', async () => {
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Project Dione',
                description: 'Test',
                revisions: 'A0, B0', // Adding B0
                project_key: 'DIO',
                number_format: 'decimal',
                flavors: [{ name: 'Flavor1', revisions: 'A0' }]
            })
        });
        const data = await res.json();
        expect(res.status).toBe(200);
        expect(data.updated).toBeDefined();
    });

    it('should verify the API returns revisions as an array correctly parsed', async () => {
        const res = await fetch(`${API_URL}/projects`);
        const projects = await res.json();
        const project = projects.find((p: any) => p.id === projectId);
        expect(project).toBeDefined();
        expect(Array.isArray(project.revisions)).toBe(true);
        expect(project.revisions).toContain('B0');
        expect(project.revisions).toContain('A0');

        // Verify that the PCB flavors are correctly parsed and returned
        expect(Array.isArray(project.flavors)).toBe(true);
        expect(project.flavors.length).toBe(1);
        expect(project.flavors[0].name).toBe('Flavor1');
    });


    it('should setup OTP, verify it, and allow creating a new owner as a guest', async () => {
        const uniqueUsername = `vitest_gowner_${Date.now()}`;
        // 1. Get OTP Setup
        const resSetup = await fetch(`${API_URL}/otp/setup?username=${uniqueUsername}`);
        expect(resSetup.status).toBe(200);
        const setupData = await resSetup.json();
        expect(setupData.secret).toBeDefined();
        expect(setupData.otpauthUrl).toBeDefined();
        
        const secret = setupData.secret;
        
        // 2. Generate expected token
        const token = generateTotp(secret);
        
        // 3. Verify OTP
        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token })
        });
        expect(resVerify.status).toBe(200);
        const verifyData = await resVerify.json();
        expect(verifyData.valid).toBe(true);

        // 4. Create new owner as guest
        const res = await fetch(`${API_URL}/owners`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-Role': 'Guest'
            },
            body: JSON.stringify({
                name: `Vitest Guest Owner ${uniqueUsername}`,
                username: uniqueUsername,
                otp_secret: secret
            })
        });
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.id).toBeDefined();
        expect(data.name).toBe(`Vitest Guest Owner ${uniqueUsername}`);
    });

    it('should allow superuser to reset OTP, log superuser actions, and confirm reset', async () => {
        // 1. Create a user to reset
        const resetUsername = `vitest_reset_${Date.now()}`;
        const initialSecret = 'ABCDEF234567XYZ2';
        const userRes = await fetch(`${API_URL}/owners`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: `Vitest Reset User`,
                username: resetUsername,
                otp_secret: initialSecret
            })
        });
        expect(userRes.status).toBe(201);
        const createdUser = await userRes.json();

        // 2. Guest attempt to reset OTP should fail
        const guestResetRes = await fetch(`${API_URL}/owners/${createdUser.id}/reset-otp`, {
            method: 'POST',
            headers: { 'X-User-Role': 'Guest' }
        });
        expect(guestResetRes.status).toBe(403);

        // 3. Super User reset OTP should succeed
        const superResetRes = await fetch(`${API_URL}/owners/${createdUser.id}/reset-otp`, {
            method: 'POST',
            headers: { 
                'X-User-Role': 'Super User',
                'X-User-Username': 'vitest_super_admin'
            }
        });
        expect(superResetRes.status).toBe(200);
        const resetData = await superResetRes.json();
        expect(resetData.token).toBeDefined();
        expect(resetData.resetLink).toBe(`/reset-otp?token=${resetData.token}`);

        // 4. Verify database audit logs
        const auditRes = await fetch(`${API_URL}/owners/${createdUser.id}`);
        expect(auditRes.status).toBe(200);
        const auditedOwner = await auditRes.json();
        expect(auditedOwner.otp_reset_by).toBe('vitest_super_admin');
        expect(auditedOwner.otp_reset_at).toBeDefined();
        expect(auditedOwner.otp_reset_token).toBe(resetData.token);

        // 5. Fetch reset info via token
        const infoRes = await fetch(`${API_URL}/otp/reset-info?token=${resetData.token}`);
        expect(infoRes.status).toBe(200);
        const infoData = await infoRes.json();
        expect(infoData.valid).toBe(true);
        expect(infoData.owner.username).toBe(resetUsername);

        // 6. Generate a new valid OTP token to confirm reset
        const newSecret = 'WXYZABC234567XYZ';
        const verifyCode = generateTotp(newSecret);

        const confirmRes = await fetch(`${API_URL}/otp/reset-confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: resetData.token,
                secret: newSecret,
                code: verifyCode
            })
        });
        expect(confirmRes.status).toBe(200);

        // 7. Verify fields are cleared and otp_secret is updated
        const finalCheckRes = await fetch(`${API_URL}/owners/${createdUser.id}`);
        const finalOwner = await finalCheckRes.json();
        expect(finalOwner.otp_secret).toBe(newSecret);
        expect(finalOwner.otp_reset_token).toBeNull();
        expect(finalOwner.otp_reset_expires).toBeNull();
    });

    it('should delete the test project', async () => {
        if (!projectId) return;
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
            method: 'DELETE'
        });
        expect(res.status).toBe(200);
    });

    afterAll(async () => {
        try {
            await cleanupTestData();
        } catch (e) {
            console.error('Failed to run database cleanup:', e);
        }
    });
});
