// Removed numbers and visually ambiguous letters (0, O, 1, I, L, Z)
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXY';

export function generateCRC(input: string): string {
    let sum = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input[i].toUpperCase();
        sum += char.charCodeAt(0) * (i + 1);
    }
    return CHARSET[sum % CHARSET.length];
}

export function levenshteinDistance(a: string, b: string): number {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export function findClosestBoard(query: string, boards: { board_number: string }[]): string | null {
    if (boards.some(b => b.board_number === query)) return query;

    query = query.toUpperCase();
    
    let bestMatch: string | null = null;
    let bestDistance = Infinity;

    for (const board of boards) {
        const bn = board.board_number.toUpperCase();
        const dist = levenshteinDistance(query, bn);
        
        let score = dist;
        
        // Since boards are formatted like 'MAP-0001K', we check if the last character matches 
        // to give a strong CRC anchor bonus during typos.
        if (query.length > 2 && bn.length > 2) {
             const queryCRC = query.slice(-1);
             const boardCRC = bn.slice(-1);
             
             if (queryCRC === boardCRC) {
                  score -= 2; // Huge bonus for matching CRC
             }
        }

        if (score < bestDistance) {
            bestDistance = score;
            bestMatch = board.board_number;
        }
    }

    // Only auto-correct if it's reasonably close (score <= 3 or distance strictly close)
    if (bestDistance <= 3) {
        return bestMatch;
    }

    return null;
}
