import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { cleanupTestData } from './cleanup';

const API_URL = 'http://localhost:5002/api';

function base32ToBuf(base32: string): Buffer {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let clean = base32.trim().replace(/=+$/, '').replace(/\s+/g, '').toUpperCase();
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

function generateTotp(secret: string, time = Date.now()): string {
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

describe('OTP & Authenticator QR Code API', () => {
    beforeAll(async () => {
        await cleanupTestData();
    });

    afterAll(async () => {
        await cleanupTestData();
    });

    it('should generate an RFC 6238 Key URI with an unencoded colon between issuer and account name', async () => {
        const res = await fetch(`${API_URL}/otp/setup?username=alice`);
        expect(res.status).toBe(200);
        const data = await res.json();
        
        expect(data.secret).toBeDefined();
        expect(data.secret.length).toBe(16);
        expect(data.otpauthUrl).toBeDefined();

        // Must start with standard otpauth://totp/
        expect(data.otpauthUrl.startsWith('otpauth://totp/')).toBe(true);

        // Path must have literal colon separating issuer and account: ReworkTracker:alice
        const url = new URL(data.otpauthUrl);
        expect(url.protocol).toBe('otpauth:');
        expect(url.host).toBe('totp');
        expect(url.pathname).toBe('/ReworkTracker:alice');
        expect(data.otpauthUrl).toContain('otpauth://totp/ReworkTracker:alice?');

        // Must not encode the separating colon as %3A
        expect(data.otpauthUrl).not.toContain('ReworkTracker%3A');

        // Query parameters
        expect(url.searchParams.get('secret')).toBe(data.secret);
        expect(url.searchParams.get('issuer')).toBe('ReworkTracker');
    });

    it('should strip port from host and format account name cleanly without colons', async () => {
        const res = await fetch(`${API_URL}/otp/setup?username=bob&host=localhost:5173`);
        expect(res.status).toBe(200);
        const data = await res.json();

        // Host port :5173 must be stripped to prevent extra colons in account name
        expect(data.otpauthUrl).not.toContain(':5173');
        expect(data.otpauthUrl).toContain('ReworkTracker:bob%20(localhost)');

        const url = new URL(data.otpauthUrl);
        expect(url.searchParams.get('issuer')).toBe('ReworkTracker');
        expect(url.searchParams.get('secret')).toBe(data.secret);
    });

    it('should verify valid TOTP token successfully statelessly', async () => {
        const resSetup = await fetch(`${API_URL}/otp/setup?username=carol`);
        const { secret } = await resSetup.json();
        const code = generateTotp(secret);

        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token: code })
        });
        expect(resVerify.status).toBe(200);
        const verifyData = await resVerify.json();
        expect(verifyData.valid).toBe(true);
    });

    it('should tolerate spaces in user-entered token (e.g. "123 456")', async () => {
        const resSetup = await fetch(`${API_URL}/otp/setup?username=david`);
        const { secret } = await resSetup.json();
        const code = generateTotp(secret);
        const spacedCode = `${code.slice(0, 3)} ${code.slice(3)}`;

        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token: spacedCode })
        });
        expect(resVerify.status).toBe(200);
        const verifyData = await resVerify.json();
        expect(verifyData.valid).toBe(true);
    });

    it('should reject invalid verification code', async () => {
        const resSetup = await fetch(`${API_URL}/otp/setup?username=eve`);
        const { secret } = await resSetup.json();

        const resVerify = await fetch(`${API_URL}/otp/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secret, token: '000000' })
        });
        expect(resVerify.status).toBe(200);
        const verifyData = await resVerify.json();
        expect(verifyData.valid).toBe(false);
    });
});
