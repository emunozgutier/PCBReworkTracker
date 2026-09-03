declare const __PORT__: string;

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrUrlOptions {
    urlType?: 'full' | 'compressed';
    baseUrlType?: 'current' | 'custom';
    customBaseUrl?: string;
    errorCorrectionLevel?: QrErrorCorrectionLevel;
    qrCodeMode?: 'byte' | 'alphanumeric';
}

export const QR_ERROR_CORRECTION_LEVELS: {
    level: QrErrorCorrectionLevel;
    label: string;
    recoveryPercent: string;
    description: string;
}[] = [
    {
        level: 'L',
        label: 'Low (L)',
        recoveryPercent: '~7%',
        description: 'Maximum capacity & simplest look. Best for compact 21x21 codes.'
    },
    {
        level: 'M',
        label: 'Medium (M)',
        recoveryPercent: '~15%',
        description: 'Good balance of capacity and error tolerance.'
    },
    {
        level: 'Q',
        label: 'Quartile (Q)',
        recoveryPercent: '~25%',
        description: 'High reliability when codes may get partially smudged.'
    },
    {
        level: 'H',
        label: 'High (H)',
        recoveryPercent: '~30%',
        description: 'Maximum damage resistance for harsh rework environments.'
    }
];

const QR_BYTE_CAPACITIES: Record<QrErrorCorrectionLevel, number[]> = {
    L: [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458],
    M: [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362],
    Q: [0, 11, 20, 32, 46, 62, 76, 88, 110, 132, 151, 180, 203, 235, 258],
    H: [0, 7, 14, 24, 34, 46, 58, 64, 84, 100, 119, 137, 155, 177, 194]
};

// ISO/IEC 18004 standard max Alphanumeric-mode character capacities per Version (1-14)
const QR_ALPHANUMERIC_CAPACITIES: Record<QrErrorCorrectionLevel, number[]> = {
    L: [0, 25, 47, 77, 114, 154, 195, 224, 279, 335, 395, 468, 535, 619, 667],
    M: [0, 20, 38, 61, 90, 122, 154, 178, 221, 262, 311, 366, 419, 483, 528],
    Q: [0, 16, 29, 47, 67, 87, 108, 125, 157, 189, 221, 259, 296, 352, 376],
    H: [0, 10, 20, 35, 50, 64, 84, 93, 122, 143, 174, 200, 227, 259, 283]
};

export function getQrCapacity(version: number, level: QrErrorCorrectionLevel = 'L', mode: 'byte' | 'alphanumeric' = 'byte'): number {
    const capacities = mode === 'alphanumeric' ? QR_ALPHANUMERIC_CAPACITIES : QR_BYTE_CAPACITIES;
    const list = capacities[level] || capacities.L;
    if (version < 1) return list[1];
    if (version >= list.length) return list[list.length - 1];
    return list[version];
}

export function getQrGridSize(version: number): number {
    const safeVersion = Math.max(1, version || 1);
    return 21 + (safeVersion - 1) * 4;
}

export function getDefaultBaseUrl(): string {
    if (typeof window !== 'undefined' && window.location.hostname.includes('github.io')) {
        const base = import.meta.env.BASE_URL || '/';
        const cleanBase = base.endsWith('/') ? base : base + '/';
        const origin = window.location.origin;
        const basePath = cleanBase === '/' ? '' : `/${cleanBase.replace(/^\/|\/$/g, '')}`;
        return `${origin}${basePath}`;
    }
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    let port = '';
    if (typeof __PORT__ !== 'undefined') {
        port = __PORT__;
    } else if (typeof window !== 'undefined') {
        port = window.location.port;
    }
    const portSuffix = port ? `:${port}` : '';
    const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    return `${protocol}//${currentHost}${portSuffix}`;
}

export function resolveQrUrl(
    boardNumber: string,
    shortCode?: string,
    options?: QrUrlOptions
): { url: string; domain: string; path: string; isCompressed: boolean; isCustomBase: boolean } {
    const urlType = options?.urlType || 'full';
    const baseUrlType = options?.baseUrlType || 'current';
    const customBase = (options?.customBaseUrl || '').trim();

    let domain = '';
    let isCustomBase = false;

    if (baseUrlType === 'custom' && customBase) {
        domain = customBase.replace(/\/+$/, '');
        isCustomBase = true;
    } else {
        domain = getDefaultBaseUrl();
    }

    // Determine path
    let path = '';
    let isCompressed = false;

    if (urlType === 'compressed' && shortCode) {
        path = `/${shortCode}`;
        isCompressed = true;
    } else {
        path = `/pcbs/${encodeURIComponent(boardNumber)}/view`;
    }

    // Ensure single slash between domain and path
    const cleanDomain = domain.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    let url = `${cleanDomain}${cleanPath}`;

    let finalDomain = cleanDomain;
    let finalPath = cleanPath;

    if (options?.qrCodeMode === 'alphanumeric') {
        url = url.toUpperCase();
        finalDomain = finalDomain.toUpperCase();
        finalPath = finalPath.toUpperCase();
    }

    return {
        url,
        domain: finalDomain,
        path: finalPath,
        isCompressed,
        isCustomBase
    };
}

/**
 * Encodes a 3-letter project key (A-Z) and 4-digit board ID (0-9999) into
 * a compact 5 to 6 character Base36 string (0-9, A-Z).
 */
export function encodeBase36ShortCode(projectKey: string, boardNumber: number | string): string {
    const cleanKey = (projectKey || "PCB").toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3).padEnd(3, 'A');
    const c0 = cleanKey.charCodeAt(0) - 65;
    const c1 = cleanKey.charCodeAt(1) - 65;
    const c2 = cleanKey.charCodeAt(2) - 65;
    const projectIndex = (Math.max(0, Math.min(25, c0)) * 676) + 
                         (Math.max(0, Math.min(25, c1)) * 26) + 
                         Math.max(0, Math.min(25, c2));
    
    let num = 0;
    if (typeof boardNumber === 'number') {
        num = boardNumber;
    } else {
        const matches = String(boardNumber).match(/\d+/g);
        if (matches && matches.length > 0) {
            num = parseInt(matches[matches.length - 1], 10);
        }
    }
    const safeNum = Math.abs(isNaN(num) ? 0 : num) % 10000;
    
    const combined = (projectIndex * 10000) + safeNum;
    return combined.toString(36).toUpperCase().padStart(5, '0');
}

/**
 * Decodes a Base36 short code back into its 3-letter project key and board number.
 */
export function decodeBase36ShortCode(code: string): { projectKey: string; boardNumber: number } | null {
    if (!code) return null;
    const cleanCode = code.toUpperCase().trim();
    if (!/^[0-9A-Z]{3,8}$/.test(cleanCode)) return null;
    
    const num = parseInt(cleanCode, 36);
    if (isNaN(num)) return null;
    
    const boardNumber = num % 10000;
    const projectIndex = Math.floor(num / 10000);
    
    const c2 = projectIndex % 26;
    const rem = Math.floor(projectIndex / 26);
    const c1 = rem % 26;
    const c0 = Math.floor(rem / 26);
    
    if (c0 < 0 || c0 > 25) return null;
    
    const projectKey = String.fromCharCode(c0 + 65, c1 + 65, c2 + 65);
    return { projectKey, boardNumber };
}

