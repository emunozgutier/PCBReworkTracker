declare const __PORT__: string;

export type QrErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QrUrlOptions {
    urlType?: 'full' | 'compressed';
    baseUrlType?: 'current' | 'custom';
    customBaseUrl?: string;
    errorCorrectionLevel?: QrErrorCorrectionLevel;
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

// ISO/IEC 18004 standard max Byte-mode character capacities per Version (1-14)
const QR_BYTE_CAPACITIES: Record<QrErrorCorrectionLevel, number[]> = {
    L: [0, 17, 32, 53, 78, 106, 134, 154, 192, 230, 271, 321, 367, 425, 458],
    M: [0, 14, 26, 42, 62, 84, 106, 122, 152, 180, 213, 251, 287, 331, 362],
    Q: [0, 11, 20, 32, 46, 62, 76, 88, 110, 132, 151, 180, 203, 235, 258],
    H: [0, 7, 14, 24, 34, 46, 58, 64, 84, 100, 119, 137, 155, 177, 194]
};

export function getQrCapacity(version: number, level: QrErrorCorrectionLevel = 'L'): number {
    const list = QR_BYTE_CAPACITIES[level] || QR_BYTE_CAPACITIES.L;
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
    const url = `${cleanDomain}${cleanPath}`;

    return {
        url,
        domain: cleanDomain,
        path: cleanPath,
        isCompressed,
        isCustomBase
    };
}
