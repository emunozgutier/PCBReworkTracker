import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/store/serverDataBase/docs/ASH/1785654979806-5595-BeagleBone_Black_PCB_RevD_250403.brd');

console.time('Read file');
const content = fs.readFileSync(filePath, 'utf-8');
console.timeEnd('Read file');
console.log('File size in chars:', content.length);

// Test 1: Scan first 1MB
console.time('Scan 1MB');
const scanContent1 = content.slice(0, 1024 * 1024);
const designatorRegex = /\b([URCDJQY]|TP|JP|CN|LED|F|FB|TP|MH|CONN)[0-9]{1,4}\b/g;
const foundDesignators = new Set();
let match;
while ((match = designatorRegex.exec(scanContent1)) !== null) {
    foundDesignators.add(match[0]);
    if (foundDesignators.size >= 400) break;
}
console.timeEnd('Scan 1MB');
console.log('1MB designators found:', foundDesignators.size);

// Test 2: Scan full file with limits
console.time('Scan full with cap');
const foundDesignators2 = new Set();
designatorRegex.lastIndex = 0;
while ((match = designatorRegex.exec(content)) !== null) {
    foundDesignators2.add(match[0]);
    if (foundDesignators2.size >= 400) break;
}
console.timeEnd('Scan full with cap');
console.log('Full with cap designators found:', foundDesignators2.size);

// Test 3: Scan full file when NO matches exist (full 43MB scan)
console.time('Full file scan (no matches)');
const nonExistentRegex = /\bNONEXISTENT[0-9]+\b/g;
let noMatch;
const foundNone = new Set();
while ((noMatch = nonExistentRegex.exec(content)) !== null) {
    foundNone.add(noMatch[0]);
}
console.timeEnd('Full file scan (no matches)');
console.log('Finished full file scan (no matches found).');

// Test 4: Net name regex scan
console.time('Net name scan (1MB)');
const netRegex = /\b(GND|VCC|VDD|3V3|5V|1V8|RESET|CLK|MISO|MOSI|SCK|CS|DDR_[A-Z0-9_]+|USB_[A-Z_]+)\b/g;
const foundNets1 = new Set();
while ((match = netRegex.exec(scanContent1)) !== null) {
    foundNets1.add(match[0]);
    if (foundNets1.size >= 100) break;
}
console.timeEnd('Net name scan (1MB)');
console.log('1MB nets found:', foundNets1.size);

console.time('Net name scan (full, no cap)');
const foundNets2 = new Set();
netRegex.lastIndex = 0;
while ((match = netRegex.exec(content)) !== null) {
    foundNets2.add(match[0]);
}
console.timeEnd('Net name scan (full, no cap)');
console.log('Full nets found:', foundNets2.size);

// Test 5: Total designators in the entire file (no cap)
console.time('Designators (full, no cap)');
const designatorRegex2 = /\b([URCDJQY]|TP|JP|CN|LED|F|FB|TP|MH|CONN)[0-9]{1,4}\b/g;
const foundDesignators3 = new Set();
let match3;
while ((match3 = designatorRegex2.exec(content)) !== null) {
    foundDesignators3.add(match3[0]);
}
console.timeEnd('Designators (full, no cap)');
console.log('Total unique designators in full file:', foundDesignators3.size);

// Test 6: Total non-unique matches in the entire file
console.time('Total non-unique matches');
let totalMatches = 0;
const designatorRegex3 = /\b([URCDJQY]|TP|JP|CN|LED|F|FB|TP|MH|CONN)[0-9]{1,4}\b/g;
while (designatorRegex3.exec(content) !== null) {
    totalMatches++;
}
console.timeEnd('Total non-unique matches');
console.log('Total non-unique matches found in full file:', totalMatches);




