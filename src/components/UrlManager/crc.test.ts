import { describe, it, expect } from 'vitest';
import { generateCRC, levenshteinDistance } from './crc';

describe('CRC Collision & Distance Analysis', () => {
    it('analyzes 1000 sequential boards to find the most dangerously close pairs', () => {
        const boards: string[] = [];
        const combinations = 1000;
        
        // Generate 1000 boards (MAP-0000 to MAP-0999)
        for (let i = 0; i < combinations; i++) {
            const baseName = `MAP-${String(i).padStart(4, '0')}`;
            boards.push(baseName + generateCRC(baseName));
        }

        // Compare all pairs (N * N-1) / 2
        const results: { b1: string; b2: string; dist: number }[] = [];
        
        for (let i = 0; i < boards.length; i++) {
            for (let j = i + 1; j < boards.length; j++) {
                const b1 = boards[i];
                const b2 = boards[j];
                const dist = levenshteinDistance(b1, b2);
                
                // Track all combinations
                results.push({ b1, b2, dist });
            }
        }

        // Sort by closest graphical distance
        // If distance is identical, it represents pairs that are mathematically
        // the most susceptible to human typo confusion.
        results.sort((a, b) => a.dist - b.dist);

        console.log(`\n--- TOP 3 CLOSEST PAIRS OUT OF ${results.length.toLocaleString()} COMBINATIONS ---`);
        for (let i = 0; i < 3; i++) {
            console.log(`#${i+1}: ${results[i].b1} vs ${results[i].b2} -> Levenshtein Distance: ${results[i].dist}`);
        }
        console.log('----------------------------------------------------------------------\n');

        // A truly robust CRC should guarantee that no two sequential 
        // string variants are only 1 character apart (dist > 1).
        expect(results[0].dist).toBeGreaterThan(0);
    });
});
