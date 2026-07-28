import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, 'logs');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// Basic User-Agent parser (very lightweight)
const parseUserAgent = (ua) => {
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

// Escape a field for CSV following RFC 4180
const escapeCsvField = (val) => {
    if (val === null || val === undefined) {
        return '';
    }
    let strVal = '';
    if (typeof val === 'object') {
        strVal = JSON.stringify(val);
    } else {
        strVal = String(val);
    }
    const escaped = strVal.replace(/"/g, '""');
    if (escaped.includes('"') || escaped.includes(',') || escaped.includes('\n') || escaped.includes('\r')) {
        return `"${escaped}"`;
    }
    return strVal;
};

// Calculate week identifier in format YYYY_weekWW
const getWeekIdentifier = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    const paddedWeek = String(weekNo).padStart(2, '0');
    return `${d.getUTCFullYear()}_week${paddedWeek}`;
};

// 60-day rotation cleanup for weekly logs
export const cleanupOldLogs = () => {
    try {
        const files = fs.readdirSync(logDir);
        const now = Date.now();
        const MAX_AGE_MS = 60 * 24 * 60 * 60 * 1000; // 60 days
        
        let deletedCount = 0;
        files.forEach(file => {
            if (file.startsWith('access-') && (file.endsWith('.log') || file.endsWith('.csv'))) {
                const filePath = path.join(logDir, file);
                const stats = fs.statSync(filePath);
                if (now - stats.mtimeMs > MAX_AGE_MS) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            }
        });
        if (deletedCount > 0) {
            console.log(`[Logger] Deleted ${deletedCount} log files older than 60 days.`);
        }
    } catch (err) {
        console.error('[Logger] Error cleaning up old logs:', err);
    }
};

// Start the cleanup interval (every 1 hour)
setInterval(cleanupOldLogs, 60 * 60 * 1000);

export const apiLoggerMiddleware = (req, res, next) => {
    // Only log API data requests (ignore static picture fetches)
    if (!req.path.startsWith('/api') || req.path.startsWith('/api/pictures')) {
        return next();
    }

    const startTime = Date.now();
    const { browser, os } = parseUserAgent(req.get('User-Agent'));
    
    // Intercept response
    const originalJson = res.json;
    const originalSend = res.send;
    let responseBody = null;

    res.json = function (body) {
        responseBody = body;
        return originalJson.call(this, body);
    };

    res.send = function (body) {
        if (!responseBody) responseBody = body; // capture if json wasn't called
        return originalSend.call(this, body);
    };

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const now = new Date();
        const weekId = getWeekIdentifier(now);
        const logFile = path.join(logDir, `access-${weekId}.log`);
        const logFileCsv = path.join(logDir, `access-${weekId}.csv`);
        
        const username = req.headers['x-user-username'] || 'guest';
        const name = req.headers['x-user-name'] || 'Guest';
        const role = req.headers['x-user-role'] || 'Guest';

        const logEntry = {
            timestamp: now.toISOString(),
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            user: {
                username,
                name,
                role
            },
            method: req.method,
            url: req.originalUrl,
            os,
            browser,
            statusCode: res.statusCode,
            durationMs: duration,
            requestBody: req.method !== 'GET' ? req.body : undefined,
            responseBody: responseBody,
            error: res.statusCode >= 400 ? responseBody : undefined
        };

        try {
            fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
        } catch (err) {
            console.error('[Logger] Failed to write to log file:', err);
        }

        // CSV Log writing
        const csvHeaders = ['timestamp', 'ip', 'username', 'name', 'role', 'method', 'url', 'os', 'browser', 'statusCode', 'durationMs', 'requestBody', 'responseBody', 'error'];
        const csvRow = [
            logEntry.timestamp,
            logEntry.ip,
            username,
            name,
            role,
            logEntry.method,
            logEntry.url,
            logEntry.os,
            logEntry.browser,
            logEntry.statusCode,
            logEntry.durationMs,
            logEntry.requestBody,
            logEntry.responseBody,
            logEntry.error
        ].map(escapeCsvField).join(',') + '\n';

        try {
            const csvExists = fs.existsSync(logFileCsv);
            if (!csvExists) {
                const headerRow = csvHeaders.join(',') + '\n';
                fs.writeFileSync(logFileCsv, headerRow);
            }
            fs.appendFileSync(logFileCsv, csvRow);
        } catch (err) {
            console.error('[Logger] Failed to write to CSV log file:', err);
        }
    });

    next();
};
