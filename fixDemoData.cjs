const fs = require('fs');

const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXY';

function generateCRC(input) {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input[i].toUpperCase();
        sum += char.charCodeAt(0) * (i + 1);
    }
    return CHARSET[sum % CHARSET.length];
}

const data = JSON.parse(fs.readFileSync('./src/demoData.json', 'utf8'));

// Transform function
function convertBoard(old) {
    const parts = old.split('-');
    if (parts.length !== 2) return old;
    const baseName = `${parts[0]}-${parts[1].padStart(4, '0')}`;
    return baseName + generateCRC(baseName);
}

// 1. Update Projects array
data.demoProjects.forEach(proj => {
    if (proj.pcbs) {
        proj.pcbs = proj.pcbs.map(old => convertBoard(old));
    }
});

// 2. Update PCBs array
data.demoPcbs.forEach(pcb => {
    if (pcb.board_number) {
        pcb.board_number = convertBoard(pcb.board_number);
    }
});

// 3. Update Reworks
const REWORK_TYPES = ["Major Component Swap", "Minor Rework", "Silicon Replacement", "Debug / Trace Cut"];
data.demoReworks.forEach((rw, index) => {
    if (rw.pcb_board_number) {
        const oldBoard = rw.pcb_board_number;
        const newBoard = convertBoard(oldBoard);
        
        // Fix board ref
        rw.pcb_board_number = newBoard;
        
        // Fix image array strings
        if (typeof rw.image_path === 'string') {
            rw.image_path = rw.image_path.replace(new RegExp(oldBoard, 'g'), newBoard);
        }
    }
    
    // Add new data schema field
    if (!rw.rework_type) {
        rw.rework_type = REWORK_TYPES[index % REWORK_TYPES.length];
    }
});

fs.writeFileSync('./src/demoData.json', JSON.stringify(data, null, 4));
console.log('Demo Data updated.');

