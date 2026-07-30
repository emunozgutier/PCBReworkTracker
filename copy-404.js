import fs from 'fs';
import path from 'path';

const src = path.join('dist', 'index.html');
const dest = path.join('dist', '404.html');

try {
    fs.copyFileSync(src, dest);
    console.log('Successfully copied index.html to 404.html');
} catch (err) {
    console.error('Failed to copy index.html to 404.html:', err);
    process.exit(1);
}
