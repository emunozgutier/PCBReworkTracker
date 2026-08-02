import { COLORS } from '../store/useStyles';
import { useAppState } from '../store/useAppState';
import { usePcbStore } from '../store/clientDataBase/usePcbStore';
import { formatCrc } from './UrlManager/crc';
import './BoardName.css';

export function getMaxCrcLength(items: any[], crcFormat: 'letter' | 'nato'): number {
    const lengths = items.map(item => {
        const bName = item.board_number || '';
        if (bName.includes('-')) {
            const parts = bName.split('-');
            const lastPart = parts[parts.length - 1] || '';
            if (lastPart.length > 1 && /^[a-zA-Z]$/.test(lastPart.slice(-1)) && /^\d$/.test(lastPart.slice(-2, -1))) {
                const crcChar = lastPart.slice(-1);
                return formatCrc(crcChar, crcFormat).length;
            }
        }
        return 0;
    });
    const maxVal = Math.max(...lengths, 0);
    return maxVal > 0 ? maxVal : (crcFormat === 'nato' ? 8 : 1);
}

export function BoardName({ name, isHex, crcColor = COLORS.purple, maxCrcLength }: { name: string; isHex?: boolean; crcColor?: string; maxCrcLength?: number }) {
    const { crcFormat } = useAppState();
    const { pcbs } = usePcbStore();

    if (!name) return null;
    
    // If it's a hex number, there is no CRC, so just return the raw string
    if (isHex) return <span style={{ whiteSpace: 'pre' }}>{name}</span>;
    
    if (name.includes('-')) {
        const firstHyphenIndex = name.indexOf('-');
        const project = name.substring(0, firstHyphenIndex);
        const rest = name.substring(firstHyphenIndex + 1);
        
        let number = rest;
        let crc = '';
        
        // Check if the rest ends with a CRC letter, e.g., "0001K"
        // The last character is a letter, and the character before it is a digit.
        if (rest.length > 1 && /^[a-zA-Z]$/.test(rest.slice(-1)) && /^\d$/.test(rest.slice(-2, -1))) {
            crc = rest.slice(-1);
            number = rest.slice(0, -1);
        }
        
        const paddedProject = project.padEnd(3, ' ');
        const paddedNumber = number.padEnd(3, ' ');
        
        // Find the maximum CRC text length
        let targetCrcLen = maxCrcLength;
        if (targetCrcLen === undefined) {
            targetCrcLen = getMaxCrcLength(pcbs, crcFormat);
        }

        const crcText = crc ? formatCrc(crc, crcFormat) : '';
        const paddedCrc = crcText.padEnd(targetCrcLen, ' ');
        
        return (
            <span style={{ whiteSpace: 'pre' }}>
                {paddedProject}-{paddedNumber}
                <span style={{ color: crcColor, fontWeight: 'bold' }}>
                    {paddedCrc}
                </span>
            </span>
        );
    }
    
    // Fallback if it doesn't contain a hyphen
    return <span style={{ whiteSpace: 'pre' }}>{name}</span>;
}
