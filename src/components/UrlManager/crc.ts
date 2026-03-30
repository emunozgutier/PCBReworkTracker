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

