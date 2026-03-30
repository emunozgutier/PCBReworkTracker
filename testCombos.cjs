const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXY';

function generateCRC(input) {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input[i].toUpperCase();
        sum += char.charCodeAt(0) * (i + 1);
    }
    return CHARSET[sum % CHARSET.length];
}

function typoDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = (b.charAt(i - 1) === a.charAt(j - 1)) ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
            if (i > 1 && j > 1 && b.charAt(i - 1) === a.charAt(j - 2) && b.charAt(i - 2) === a.charAt(j - 1)) {
                matrix[i][j] = Math.min(matrix[i][j], matrix[i - 2][j - 2] + cost);
            }
        }
    }
    return matrix[b.length][a.length];
}

const list = ["MAW-0001", "MWA-0001", "BOX-0001", "OBX-0001", "AB-0000", "BA-0000"];

console.log("Analyzing Transpositions...");
list.push("MAP-0001");

const generated = [];

for (let r = 65; r <= 90; r++) {
    for (let c = 65; c <= 90; c++) {
        if (Math.abs(r - c) === 22) {
             let base1 = `M${String.fromCharCode(r)}${String.fromCharCode(c)}-0001`;
             let base2 = `M${String.fromCharCode(c)}${String.fromCharCode(r)}-0001`;
             generated.push(base1 + generateCRC(base1));
             generated.push(base2 + generateCRC(base2));
        }
    }
}

for (let i=0; i<generated.length; i+=2) {
    const d = typoDistance(generated[i], generated[i+1]);
    console.log(`Test: ${generated[i]} vs ${generated[i+1]} -> DIST: ${d}`);
}

