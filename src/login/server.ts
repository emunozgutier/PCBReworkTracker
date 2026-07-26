import express, { type Request, type Response } from 'express';
import crypto from 'crypto';
import { db } from '../store/database/db.js';
import { verify, generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';

export const loginRouter = express.Router();

// 1. Verify TOTP Code & Establish Session (3 Days)
loginRouter.post('/verify-totp', (req: Request, res: Response) => {
    const { username, otp } = req.body;
    if (!username || !otp) {
        return res.status(400).json({ error: "Username and Authenticator code are required." });
    }

    const cleanUsername = username.trim().toLowerCase();
    
    // Fetch owner profile
    db.get(
        "SELECT * FROM owners WHERE username = ?",
        [cleanUsername],
        (errOwner: any, ownerRow: any) => {
            if (errOwner) return res.status(500).json({ error: errOwner.message });
            if (!ownerRow) return res.status(400).json({ error: "Invalid username." });

            if (!ownerRow.totp_secret) {
                return res.status(400).json({ error: "Your account is not set up with an authenticator. Please ask an administrator to reset your QR code." });
            }

            // Verify TOTP token
            const result = verify({ token: otp.trim(), secret: ownerRow.totp_secret });
            
            if (!result) {
                return res.status(400).json({ error: "Invalid code. Please check your authenticator app and try again." });
            }

            // Code is valid! Create user session valid for exactly 3 days to force reverification
            const token = crypto.randomUUID();
            const sessionExpires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days

            db.run(
                "INSERT INTO user_sessions (token, email, expires_at) VALUES (?, ?, ?)",
                [token, ownerRow.email || ownerRow.username, sessionExpires],
                (sessionErr: any) => {
                    if (sessionErr) {
                        return res.status(500).json({ error: "Failed to create user session." });
                    }
                    
                    res.json({
                        token,
                        email: ownerRow.email || ownerRow.username,
                        expiresAt: sessionExpires,
                        owner: ownerRow
                    });
                }
            );
        }
    );
});

// 2. Verify Active Session Token
loginRouter.post('/verify-session', (req: Request, res: Response) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({ valid: false, error: "No token provided." });
    }

    db.get(
        "SELECT * FROM user_sessions WHERE token = ?",
        [token],
        (err: any, sessionRow: any) => {
            if (err || !sessionRow) {
                return res.json({ valid: false });
            }

            // Check session expiration (3 days limit is enforced here)
            if (new Date(sessionRow.expires_at).getTime() < Date.now()) {
                db.run("DELETE FROM user_sessions WHERE token = ?", [token]);
                return res.json({ valid: false });
            }

            // Fetch active owner profile associated with session email
            db.get(
                "SELECT * FROM owners WHERE email = ? OR username = ?",
                [sessionRow.email, sessionRow.email],
                (errOwner: any, ownerRow: any) => {
                    if (errOwner || !ownerRow) {
                        return res.json({ valid: false });
                    }

                    res.json({
                        valid: true,
                        email: sessionRow.email,
                        owner: ownerRow
                    });
                }
            );
        }
    );
});

// 3. Logout Session
loginRouter.post('/logout', (req: Request, res: Response) => {
    const { token } = req.body;
    if (token) {
        db.run("DELETE FROM user_sessions WHERE token = ?", [token]);
    }
    res.json({ message: "Successfully logged out." });
});

// 4. Admin Reset TOTP QR Code
loginRouter.post('/owners/:id/reset-totp', (req: Request, res: Response) => {
    const userId = req.params.id;
    
    // In a real production app, verify if the requester has admin/superuser rights.
    // For now, we will simply generate a new secret for the user.
    db.get("SELECT * FROM owners WHERE id = ?", [userId], async (err: any, owner: any) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!owner) return res.status(404).json({ error: "User not found." });

        try {
            const secret = generateSecret();
            const otpauth = generateURI({ issuer: 'PCB Rework Tracker', label: owner.username, secret });
            const qrCodeDataUrl = await QRCode.toDataURL(otpauth);
            
            db.run("UPDATE owners SET totp_secret = ? WHERE id = ?", [secret, userId], (updateErr: any) => {
                if (updateErr) return res.status(500).json({ error: "Failed to save new TOTP secret." });
                
                res.json({ success: true, qrCodeDataUrl });
            });
        } catch (qrErr: any) {
            res.status(500).json({ error: "Failed to generate QR Code image." });
        }
    });
});
