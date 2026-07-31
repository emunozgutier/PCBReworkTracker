import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'pcb_tracker.db');
console.log("Opening DB:", dbPath);
const db = new sqlite3.Database(dbPath);

console.log("Getting edmu...");
db.get("SELECT id, login_attempts FROM owners WHERE username = ?", ['edmu'], (err, row) => {
    if (err) {
        console.error("Get error:", err);
        return;
    }
    console.log("Row:", row);
    
    console.log("Updating login_attempts...");
    db.run("UPDATE owners SET login_attempts = ? WHERE id = ?", [JSON.stringify([{ timestamp: Date.now(), success: false }]), row.id], (updateErr) => {
        if (updateErr) {
            console.error("Update error:", updateErr);
            return;
        }
        console.log("Update successful!");
        db.close();
    });
});
